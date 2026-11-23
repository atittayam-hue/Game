import React, { useMemo, useState } from 'react';
import {
  Award,
  Check,
  Download,
  RotateCcw,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { ParticipantResult, QuizDeck } from '../types/game';
import { downloadResultsCSV } from '../utils/csv';
import { soundFX } from '../utils/sound';
import { AvatarSvg } from './AvatarSvg';

interface ResultsDashboardProps {
  currentGameResults: ParticipantResult[];
  allRecordedStudents: ParticipantResult[];
  activePlayerId: string | null;
  deck: QuizDeck;
  onPlayAgainSameStudent?: () => void;
  onRegisterNextStudent: () => void;
  onClearHistory: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  currentGameResults,
  allRecordedStudents,
  activePlayerId,
  deck,
  onPlayAgainSameStudent,
  onRegisterNextStudent,
  onClearHistory,
}) => {
  const [viewScope, setViewScope] = useState<'round' | 'session'>('round');
  const [csvDownloaded, setCsvDownloaded] = useState(false);

  const displayedResults = useMemo(() => {
    const source =
      viewScope === 'round' && currentGameResults.length > 0
        ? currentGameResults
        : allRecordedStudents;

    return [...source].sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return a.avgTimeSec - b.avgTimeSec;
    });
  }, [allRecordedStudents, currentGameResults, viewScope]);

  const activePlayerIndex = displayedResults.findIndex((r) => r.id === activePlayerId);
  const activePlayer =
    activePlayerIndex >= 0
      ? displayedResults[activePlayerIndex]
      : displayedResults.find((r) => !r.isSimulated) ?? displayedResults[0];
  const activeRank = activePlayerIndex >= 0 ? activePlayerIndex + 1 : 1;

  const topThree = displayedResults.slice(0, 3);
  const podiumOrder = [
    topThree[1] ? { rank: 2, entry: topThree[1] } : null,
    topThree[0] ? { rank: 1, entry: topThree[0] } : null,
    topThree[2] ? { rank: 3, entry: topThree[2] } : null,
  ].filter(Boolean) as { rank: 1 | 2 | 3; entry: ParticipantResult }[];

  const handleDownloadCsv = (scope: 'current' | 'all') => {
    soundFX.playClick();
    const targetData =
      scope === 'current' && currentGameResults.length > 0
        ? displayedResults
        : allRecordedStudents;
    const prefix =
      scope === 'current' ? `kahoot-ranking-${deck.id}` : 'kahoot-all-students';
    downloadResultsCSV(targetData, prefix);
    setCsvDownloaded(true);
    window.setTimeout(() => setCsvDownloaded(false), 3000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Header & Primary Export CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-700">
            สรุปผลการแข่งขัน · {deck.title}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            อันดับคะแนนและข้อมูลนักศึกษา
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleDownloadCsv('current')}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap shrink-0"
          >
            {csvDownloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            <span>{csvDownloaded ? 'ดาวน์โหลด CSV สำเร็จ' : 'ดาวน์โหลดไฟล์ CSV'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onRegisterNextStudent();
            }}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>นักศึกษาคนถัดไป</span>
          </button>

          {activePlayer && !activePlayer.isSimulated && onPlayAgainSameStudent && (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onPlayAgainSameStudent();
              }}
              className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              <span>เล่นอีกครั้ง</span>
            </button>
          )}
        </div>
      </div>

      {/* Podium + Personal Breakdown Split */}
      <div className="mt-7 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Top 3 Podium */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Award className="h-5 w-5 text-amber-500" />
              <span>โพเดียม 3 อันดับแรก</span>
            </h2>
            <span className="font-mono-tabular text-xs text-slate-500">
              ผู้เข้าร่วมทั้งหมด {displayedResults.length} คน
            </span>
          </div>

          <div className="mt-8 grid grid-cols-3 items-end gap-3 sm:gap-5">
            {podiumOrder.map(({ rank, entry }) => {
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const barHeight = isFirst
                ? 'h-36 bg-amber-400/20 border-amber-300'
                : isSecond
                  ? 'h-28 bg-slate-100 border-slate-300'
                  : 'h-22 bg-orange-50 border-orange-200';
              const badgeColor = isFirst
                ? 'text-amber-700'
                : isSecond
                  ? 'text-slate-700'
                  : 'text-orange-700';

              return (
                <div key={entry.id} className="flex flex-col items-center text-center">
                  <div className="relative">
                    <AvatarSvg
                      config={entry.avatar}
                      size={isFirst ? 88 : 72}
                      className={entry.id === activePlayer?.id ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}
                    />
                  </div>
                  <div className="mt-2.5 max-w-full truncate text-sm font-bold text-slate-900">
                    {entry.student.nickname}
                  </div>
                  <div className="font-mono-tabular text-xs text-slate-500">
                    {entry.student.studentId}
                  </div>
                  <div className="font-mono-tabular mt-1 text-sm font-extrabold text-indigo-700">
                    {entry.totalScore.toLocaleString()}
                  </div>
                  <div
                    className={`mt-2.5 flex w-full flex-col items-center justify-center rounded-t-xl border border-b-0 px-2 ${barHeight}`}
                  >
                    <span className={`font-display text-2xl font-extrabold ${badgeColor}`}>
                      #{rank}
                    </span>
                    <span className="font-mono-tabular text-xs text-slate-600">
                      ถูก {entry.correctCount}/{entry.totalQuestions}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Student Detailed Analytics */}
        {activePlayer && (
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 lg:col-span-5">
            <div>
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <AvatarSvg config={activePlayer.avatar} size={64} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-indigo-700">
                    ผลงานของนักศึกษา · อันดับที่ #{activeRank}
                  </div>
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {activePlayer.student.fullName} ({activePlayer.student.nickname})
                  </h2>
                  <div className="mt-0.5 text-xs text-slate-500">
                    <span className="font-mono-tabular">รหัส {activePlayer.student.studentId}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>{activePlayer.student.major}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-slate-500">คะแนนรวม</div>
                  <div className="font-mono-tabular mt-0.5 text-xl font-bold text-slate-900">
                    {activePlayer.totalScore.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">ความแม่นยำ</div>
                  <div className="font-mono-tabular mt-0.5 text-xl font-bold text-slate-900">
                    {activePlayer.accuracyPercent}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">เวลาเฉลี่ย</div>
                  <div className="font-mono-tabular mt-0.5 text-xl font-bold text-slate-900">
                    {activePlayer.avgTimeSec.toFixed(1)}s
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">ต่อเนื่องสูงสุด</div>
                  <div className="font-mono-tabular mt-0.5 text-xl font-bold text-slate-900">
                    {activePlayer.maxStreak} ข้อ
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs font-semibold text-slate-500">รายละเอียดคำตอบรายข้อ</div>
                <div className="mt-2.5 space-y-2">
                  {activePlayer.attempts.map((att) => (
                    <div
                      key={att.questionNumber}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono-tabular font-bold text-slate-700">
                          ข้อ {att.questionNumber}
                        </span>
                        <span
                          className={`font-semibold ${
                            att.isCorrect ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {att.selectedIndex === null
                            ? 'หมดเวลา'
                            : att.isCorrect
                              ? 'ถูกต้อง'
                              : 'ผิด'}
                        </span>
                      </div>
                      <div className="font-mono-tabular flex items-center gap-4 text-slate-600">
                        <span>{att.timeTakenSec.toFixed(1)} วินาที</span>
                        <span className="w-16 text-right font-bold text-slate-900">
                          +{att.pointsEarned}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Ranking & Student Data Table */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">ตารางอันดับและข้อมูลนักศึกษาทั้งหมด</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              รองรับการส่งออกไฟล์ CSV ภาษาไทย (UTF-8 BOM) สำหรับเปิดใน Microsoft Excel และ Google Sheets
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentGameResults.length > 0 && (
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewScope('round')}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    viewScope === 'round'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  รอบล่าสุด ({currentGameResults.length})
                </button>
                <button
                  type="button"
                  onClick={() => setViewScope('session')}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    viewScope === 'session'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  นักศึกษาทั้งหมดในระบบ ({allRecordedStudents.length})
                </button>
              </div>
            )}

            {allRecordedStudents.length > 0 && (
              <button
                type="button"
                onClick={() => handleDownloadCsv('all')}
                className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>ส่งออกนักศึกษาที่บันทึกทั้งหมด ({allRecordedStudents.length})</span>
              </button>
            )}

            {allRecordedStudents.length > 0 && viewScope === 'session' && (
              <button
                type="button"
                onClick={onClearHistory}
                className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>ล้างประวัติเซสชัน</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 pr-4">อันดับ</th>
                <th className="py-3 pr-4">อวตารและชื่อนักศึกษา</th>
                <th className="py-3 pr-4">รหัสนักศึกษา</th>
                <th className="py-3 pr-4">คณะ / สาขาวิชา</th>
                <th className="py-3 pr-4">ชั้นปี</th>
                <th className="py-3 pr-4 text-right">คะแนนรวม</th>
                <th className="py-3 pr-4 text-right">ตอบถูก</th>
                <th className="py-3 pr-4 text-right">ความแม่นยำ</th>
                <th className="py-3 text-right">เวลาเฉลี่ย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedResults.map((entry, idx) => {
                const isActive = entry.id === activePlayer?.id;
                return (
                  <tr
                    key={entry.id}
                    className={isActive ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}
                  >
                    <td className="font-mono-tabular py-3.5 pr-4 font-bold text-slate-900">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <AvatarSvg config={entry.avatar} size={38} />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {entry.student.fullName}
                            {isActive && (
                              <span className="ml-2 text-xs font-semibold text-indigo-700">
                                (ล่าสุด)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            ชื่อในเกม: {entry.student.nickname}
                            {entry.isSimulated ? ' · ผู้ร่วมแข่งขันจำลอง' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono-tabular py-3.5 pr-4 font-medium text-slate-700">
                      {entry.student.studentId}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">
                      <div className="text-slate-800">{entry.student.faculty}</div>
                      <div className="text-xs text-slate-500">{entry.student.major}</div>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600 whitespace-nowrap">
                      {entry.student.year} ({entry.student.section || 'Sec 01'})
                    </td>
                    <td className="font-mono-tabular py-3.5 pr-4 text-right font-bold text-slate-900">
                      {entry.totalScore.toLocaleString()}
                    </td>
                    <td className="font-mono-tabular py-3.5 pr-4 text-right text-slate-700">
                      {entry.correctCount}/{entry.totalQuestions}
                    </td>
                    <td className="font-mono-tabular py-3.5 pr-4 text-right text-slate-700">
                      {entry.accuracyPercent}%
                    </td>
                    <td className="font-mono-tabular py-3.5 text-right text-slate-700">
                      {entry.avgTimeSec.toFixed(1)}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {displayedResults.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              ยังไม่มีข้อมูลนักศึกษาที่บันทึกไว้ในเซสชันนี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
