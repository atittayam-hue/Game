import { ParticipantResult } from '../types/game';

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildResultsCSV(results: ParticipantResult[]): string {
  const sorted = [...results].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.avgTimeSec - b.avgTimeSec;
  });

  const headers = [
    'อันดับ',
    'รหัสนักศึกษา',
    'ชื่อ-นามสกุล',
    'ชื่อเล่น',
    'คณะ',
    'สาขาวิชา',
    'ชั้นปี',
    'กลุ่มเรียน',
    'ชุดคำถาม',
    'คะแนนรวม',
    'ตอบถูก (ข้อ)',
    'จำนวนข้อทั้งหมด',
    'ความแม่นยำ (%)',
    'เวลาเฉลี่ยต่อข้อ (วินาที)',
    'ตอบถูกต่อเนื่องสูงสุด',
    'ข้อ 1 (ผล/เวลา/คะแนน)',
    'ข้อ 2 (ผล/เวลา/คะแนน)',
    'ข้อ 3 (ผล/เวลา/คะแนน)',
    'ข้อ 4 (ผล/เวลา/คะแนน)',
    'ข้อ 5 (ผล/เวลา/คะแนน)',
    'ประเภทผู้เล่น',
    'เวลาที่บันทึก',
  ];

  const rows = sorted.map((entry, idx) => {
    const qCols = [0, 1, 2, 3, 4].map((qIdx) => {
      const attempt = entry.attempts[qIdx];
      if (!attempt) return '-';
      const status =
        attempt.selectedIndex === null
          ? 'หมดเวลา'
          : attempt.isCorrect
            ? 'ถูก'
            : 'ผิด';
      return `${status} (${attempt.timeTakenSec.toFixed(1)}s / +${attempt.pointsEarned})`;
    });

    const formattedDate = new Date(entry.completedAt).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return [
      idx + 1,
      entry.student.studentId,
      entry.student.fullName,
      entry.student.nickname,
      entry.student.faculty,
      entry.student.major,
      entry.student.year,
      entry.student.section || '-',
      entry.deckTitle,
      entry.totalScore,
      entry.correctCount,
      entry.totalQuestions,
      entry.accuracyPercent,
      entry.avgTimeSec.toFixed(1),
      entry.maxStreak,
      ...qCols,
      entry.isSimulated ? 'ผู้ร่วมแข่งขันจำลอง' : 'นักศึกษา',
      formattedDate,
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  // Add UTF-8 BOM (\uFEFF) so Thai characters render properly in Excel
  return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

export function downloadResultsCSV(results: ParticipantResult[], filenamePrefix = 'kahoot-student-results') {
  const csvContent = buildResultsCSV(results);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filenamePrefix}-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
