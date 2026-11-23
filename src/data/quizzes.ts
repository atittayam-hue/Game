import { AvatarConfig, ParticipantResult, QuizDeck, StudentInfo } from '../types/game';

export const QUIZ_TIME_PER_QUESTION = 20;
export const TOTAL_QUESTIONS_PER_GAME = 5;

export const QUIZ_DECKS: QuizDeck[] = [
  {
    id: 'digital-tech',
    title: 'เทคโนโลยีดิจิทัลและนวัตกรรม',
    subtitle: 'ความรู้พื้นฐานคอมพิวเตอร์ อินเทอร์เน็ต และวิทยาการสมัยใหม่',
    questions: [
      {
        id: 'dt-1',
        category: 'เครือข่ายและเว็บ',
        prompt: 'โปรโตคอล HTTPS เพิ่มความปลอดภัยจาก HTTP ด้วยกลไกใดเป็นหลัก?',
        options: [
          'การเข้ารหัสข้อมูลด้วย TLS/SSL ระหว่างไคลเอนต์และเซิร์ฟเวอร์',
          'การบีบอัดรูปภาพทั้งหมดให้มีขนาดเล็กลง',
          'การปิดกั้นการใช้งานคุกกี้ทุกชนิดบนเบราว์เซอร์',
          'การส่งข้อมูลผ่านพอร์ต 21 แทนพอร์ต 80',
        ],
        correctIndex: 0,
        explanation: 'HTTPS ใช้การเข้ารหัส TLS/SSL เพื่อป้องกันการดักฟังและยืนยันตัวตนของเซิร์ฟเวอร์',
      },
      {
        id: 'dt-2',
        category: 'โครงสร้างข้อมูล',
        prompt: 'โครงสร้างข้อมูลแบบ Stack ใช้หลักการจัดการลำดับข้อมูลแบบใด?',
        options: [
          'FIFO (เข้าก่อนออกก่อน)',
          'LIFO (เข้าทีหลังออกก่อน)',
          'Random Access (สุ่มตำแหน่ง)',
          'Priority Sort (เรียงตามขนาดไฟล์)',
        ],
        correctIndex: 1,
        explanation: 'Stack ทำงานแบบ Last-In, First-Out (LIFO) เช่นเดียวกับการซ้อนจาน',
      },
      {
        id: 'dt-3',
        category: 'ฐานข้อมูล',
        prompt: 'คำสั่ง SQL ใดที่ใช้สำหรับดึงข้อมูลจากตารางโดยไม่เปลี่ยนแปลงข้อมูลเดิม?',
        options: ['UPDATE', 'DELETE', 'SELECT', 'INSERT'],
        correctIndex: 2,
        explanation: 'SELECT เป็นคำสั่ง Query สำหรับสืบค้นและแสดงผลข้อมูลจากตาราง',
      },
      {
        id: 'dt-4',
        category: 'ระบบคลาวด์',
        prompt: 'รูปแบบบริการคลาวด์ที่ให้เช่าใช้ซอฟต์แวร์ผ่านเว็บเบราว์เซอร์ทันทีเรียกว่าอะไร?',
        options: ['IaaS', 'PaaS', 'SaaS', 'DNS'],
        correctIndex: 2,
        explanation: 'SaaS (Software as a Service) คือบริการซอฟต์แวร์พร้อมใช้งานผ่านอินเทอร์เน็ต',
      },
      {
        id: 'dt-5',
        category: 'ความปลอดภัยไซเบอร์',
        prompt: 'การยืนยันตัวตนแบบ Two-Factor Authentication (2FA) ช่วยเพิ่มความปลอดภัยอย่างไร?',
        options: [
          'เปลี่ยนรหัสผ่านให้สั้นลงเพื่อจำง่ายขึ้น',
          'ต้องใช้หลักฐานยืนยันตัวตนอย่างน้อย 2 ปัจจัยที่ต่างประเภทกัน',
          'เก็บประวัติการเข้าชมเว็บไซต์ไว้บนเครื่องเท่านั้น',
          'อนุญาตให้เข้าสู่ระบบได้โดยไม่ต้องกรอกรหัสผ่าน',
        ],
        correctIndex: 1,
        explanation: '2FA ผสานสิ่งที่รู้ (รหัสผ่าน) กับสิ่งที่มี (OTP/อุปกรณ์) เพื่อลดความเสี่ยงจากการถูกขโมยรหัส',
      },
    ],
  },
  {
    id: 'general-science',
    title: 'วิทยาศาสตร์และตรรกะรอบตัว',
    subtitle: 'ฟิสิกส์พื้นฐาน ชีววิทยา โลกและดาราศาสตร์สำหรับนักศึกษา',
    questions: [
      {
        id: 'gs-1',
        category: 'โลกและบรรยากาศ',
        prompt: 'แก๊สชนิดใดมีสัดส่วนมากที่สุดในชั้นบรรยากาศของโลก?',
        options: ['ออกซิเจน (O₂)', 'คาร์บอนไดออกไซด์ (CO₂)', 'ไนโตรเจน (N₂)', 'อาร์กอน (Ar)'],
        correctIndex: 2,
        explanation: 'บรรยากาศโลกประกอบด้วยไนโตรเจนประมาณ 78% และออกซิเจนประมาณ 21%',
      },
      {
        id: 'gs-2',
        category: 'ฟิสิกส์พื้นฐาน',
        prompt: 'หน่วยวัดความถี่ของคลื่นในระบบ SI คือข้อใด?',
        options: ['นิวตัน (N)', 'จูล (J)', 'เฮิรตซ์ (Hz)', 'วัตต์ (W)'],
        correctIndex: 2,
        explanation: '1 เฮิรตซ์ (Hz) หมายถึงความถี่ 1 รอบต่อวินาที',
      },
      {
        id: 'gs-3',
        category: 'ชีววิทยา',
        prompt: 'ออร์แกเนลล์ใดภายในเซลล์ที่ทำหน้าที่หลักในการสร้างพลังงาน ATP?',
        options: ['ไรโบโซม', 'ไมโทคอนเดรีย', 'กอลจิบอดี', 'ไลโซโซม'],
        correctIndex: 1,
        explanation: 'ไมโทคอนเดรียเป็นแหล่งผลิตพลังงานหลักของเซลล์ผ่านกระบวนการหายใจระดับเซลล์',
      },
      {
        id: 'gs-4',
        category: 'ดาราศาสตร์',
        prompt: 'ดาวเคราะห์ดวงใดในระบบสุริยะที่มีขนาดใหญ่ที่สุด?',
        options: ['ดาวเสาร์', 'ดาวยูเรนัส', 'ดาวพฤหัสบดี', 'ดาวเนปจูน'],
        correctIndex: 2,
        explanation: 'ดาวพฤหัสบดีเป็นดาวเคราะห์แก๊สยักษ์ที่มีมวลและเส้นผ่านศูนย์กลางมากที่สุดในระบบสุริยะ',
      },
      {
        id: 'gs-5',
        category: 'ตรรกะและคณิตศาสตร์',
        prompt: 'หากลำดับตัวเลขคือ 2, 6, 12, 20, 30 ตัวเลขถัดไปคือจำนวนใด?',
        options: ['38', '40', '42', '44'],
        correctIndex: 2,
        explanation: 'ผลต่างระหว่างพจน์เพิ่มขึ้นทีละ 2 (+4, +6, +8, +10, +12) ดังนั้น 30 + 12 = 42',
      },
    ],
  },
  {
    id: 'thai-academic',
    title: 'ทักษะการสื่อสารและพลเมืองดิจิทัล',
    subtitle: 'หลักภาษา การคิดวิเคราะห์ และจริยธรรมสารสนเทศในรั้วมหาวิทยาลัย',
    questions: [
      {
        id: 'ta-1',
        category: 'การรู้เท่าทันสื่อ',
        prompt: 'ขั้นตอนแรกที่เหมาะสมที่สุดเมื่อพบข่าวสารที่แชร์ต่อกันโดยไม่ระบุแหล่งที่มาคือข้อใด?',
        options: [
          'แชร์ต่อทันทีเพื่อให้เพื่อนช่วยตรวจสอบ',
          'ตรวจสอบแหล่งข้อมูลปฐมภูมิ วันที่เผยแพร่ และความน่าเชื่อถือ',
          'อ่านเฉพาะพาดหัวข่าวแล้วสรุปใจความ',
          'บันทึกภาพหน้าจอไว้โดยไม่ต้องตรวจสอบ',
        ],
        correctIndex: 1,
        explanation: 'การตรวจสอบแหล่งที่มาและวันที่เผยแพร่ช่วยลดการส่งต่อข้อมูลคลาดเคลื่อน',
      },
      {
        id: 'ta-2',
        category: 'จริยธรรมวิชาการ',
        prompt: 'การนำข้อความหรืองานวิจัยของผู้อื่นมาใช้โดยไม่อ้างอิงแหล่งที่มาเข้าข่ายพฤติกรรมใด?',
        options: [
          'Peer Review',
          'Plagiarism (การคัดลอกผลงานทางวิชาการ)',
          'Open Access',
          'Creative Commons',
        ],
        correctIndex: 1,
        explanation: 'Plagiarism คือการนำความคิดหรือผลงานผู้อื่นมาใช้เสมือนเป็นของตนเองโดยไม่อ้างอิง',
      },
      {
        id: 'ta-3',
        category: 'หลักภาษาไทย',
        prompt: 'คำใดต่อไปนี้สะกดถูกต้องตามพจนานุกรมฉบับราชบัณฑิตยสถาน?',
        options: ['อนุญาติ', 'สังเกตุ', 'สมดุล', 'ปราถนา'],
        correctIndex: 2,
        explanation: 'คำที่ถูกต้องคือ สมดุล ส่วนคำอื่นที่ถูกคือ อนุญาต, สังเกต และ ปรารถนา',
      },
      {
        id: 'ta-4',
        category: 'การจัดการข้อมูล',
        prompt: 'รูปแบบไฟล์ CSV ย่อมาจากคำว่าอะไร?',
        options: [
          'Common System Variables',
          'Comma-Separated Values',
          'Central Storage Volume',
          'Coded Sheet Version',
        ],
        correctIndex: 1,
        explanation: 'CSV คือ Comma-Separated Values ซึ่งเป็นไฟล์ข้อความสำหรับเก็บข้อมูลตาราง',
      },
      {
        id: 'ta-5',
        category: 'การทำงานร่วมกัน',
        prompt: 'การให้ข้อเสนอแนะเชิงสร้างสรรค์ (Constructive Feedback) ควรยึดหลักใด?',
        options: [
          'มุ่งวิจารณ์ตัวบุคคลมากกว่าเนื้องาน',
          'ชี้ประเด็นที่เฉพาะเจาะจง พร้อมเหตุผลและแนวทางพัฒนาที่ชัดเจน',
          'ใช้คำพูดกำกวมเพื่อหลีกเลี่ยงการอธิบาย',
          'เปรียบเทียบคะแนนกับผู้อื่นต่อหน้ากลุ่มใหญ่',
        ],
        correctIndex: 1,
        explanation: 'ข้อเสนอแนะเชิงสร้างสรรค์ควรโฟกัสที่เนื้องาน ชัดเจน และนำไปปรับปรุงต่อได้จริง',
      },
    ],
  },
];

interface SimulatedPeerTemplate {
  student: StudentInfo;
  avatar: AvatarConfig;
  skillAccuracy: number;
  baseSpeedSec: number;
}

const PEER_TEMPLATES: SimulatedPeerTemplate[] = [
  {
    student: {
      studentId: '67010114',
      fullName: 'พิมพ์ชนก วัฒนากูล',
      nickname: 'พริม',
      faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี',
      major: 'วิทยาการคอมพิวเตอร์',
      year: 'ปี 2',
      section: 'Sec 01',
    },
    avatar: {
      bgColor: '#E0E7FF',
      skinColor: '#F3D2B3',
      hairStyle: 'ponytail',
      hairColor: '#1E1B18',
      eyeStyle: 'sparkle',
      accessory: 'roundGlasses',
      outfitStyle: 'blazer',
      outfitColor: '#312E81',
    },
    skillAccuracy: 0.86,
    baseSpeedSec: 5.2,
  },
  {
    student: {
      studentId: '67020489',
      fullName: 'ธนากร ศิริวัฒน์',
      nickname: 'ต้นกล้า',
      faculty: 'คณะวิศวกรรมศาสตร์',
      major: 'วิศวกรรมซอฟต์แวร์',
      year: 'ปี 3',
      section: 'Sec 02',
    },
    avatar: {
      bgColor: '#DBEAFE',
      skinColor: '#E5B88E',
      hairStyle: 'spiky',
      hairColor: '#292524',
      eyeStyle: 'focused',
      accessory: 'headphones',
      outfitStyle: 'hoodie',
      outfitColor: '#2563EB',
    },
    skillAccuracy: 0.78,
    baseSpeedSec: 6.4,
  },
  {
    student: {
      studentId: '67030255',
      fullName: 'ณัฐณิชา แก้วประเสริฐ',
      nickname: 'มิ้นท์',
      faculty: 'คณะบริหารธุรกิจ',
      major: 'การตลาดดิจิทัล',
      year: 'ปี 1',
      section: 'Sec 01',
    },
    avatar: {
      bgColor: '#FCE7F3',
      skinColor: '#F6DCC3',
      hairStyle: 'bob',
      hairColor: '#5B3A29',
      eyeStyle: 'happy',
      accessory: 'headband',
      outfitStyle: 'polo',
      outfitColor: '#059669',
    },
    skillAccuracy: 0.72,
    baseSpeedSec: 7.5,
  },
  {
    student: {
      studentId: '67040812',
      fullName: 'ภานุพงศ์ จันทร์เพ็ญ',
      nickname: 'ภูมิ',
      faculty: 'คณะเทคโนโลยีสารสนเทศ',
      major: 'นวัตกรรมดิจิทัล',
      year: 'ปี 2',
      section: 'Sec 03',
    },
    avatar: {
      bgColor: '#D1FAE5',
      skinColor: '#D9A477',
      hairStyle: 'sidePart',
      hairColor: '#18181B',
      eyeStyle: 'normal',
      accessory: 'squareGlasses',
      outfitStyle: 'varsity',
      outfitColor: '#D97706',
    },
    skillAccuracy: 0.64,
    baseSpeedSec: 8.8,
  },
  {
    student: {
      studentId: '67050391',
      fullName: 'กัญญาพัชร สุขสวัสดิ์',
      nickname: 'ข้าวปั้น',
      faculty: 'คณะนิเทศศาสตร์',
      major: 'สื่อดิจิทัล',
      year: 'ปี 4',
      section: 'Sec 02',
    },
    avatar: {
      bgColor: '#FEF3C7',
      skinColor: '#F3D2B3',
      hairStyle: 'bun',
      hairColor: '#3F271E',
      eyeStyle: 'wink',
      accessory: 'gradCap',
      outfitStyle: 'tshirt',
      outfitColor: '#DC2626',
    },
    skillAccuracy: 0.9,
    baseSpeedSec: 4.9,
  },
];

export function calculateQuestionScore(isCorrect: boolean, timeTakenSec: number, streakBefore: number): number {
  if (!isCorrect) return 0;
  const clampedTime = Math.max(0.2, Math.min(QUIZ_TIME_PER_QUESTION, timeTakenSec));
  const speedRatio = 1 - clampedTime / QUIZ_TIME_PER_QUESTION;
  const basePlusSpeed = Math.round(550 + speedRatio * 450);
  const streakBonus = Math.min(streakBefore, 4) * 50;
  return basePlusSpeed + streakBonus;
}

export function generateSimulatedPeerResults(deck: QuizDeck): ParticipantResult[] {
  const now = new Date().toISOString();
  return PEER_TEMPLATES.map((peer, idx) => {
    let streak = 0;
    let maxStreak = 0;
    let totalScore = 0;
    let correctCount = 0;
    let totalTime = 0;

    const attempts = deck.questions.map((q, qIdx) => {
      // Deterministic yet varied per peer & question
      const hash = ((idx + 1) * 37 + (qIdx + 1) * 53) % 100;
      const isCorrect = hash / 100 < peer.skillAccuracy;
      const timeJitter = (((idx * 13 + qIdx * 19) % 40) - 15) / 10;
      const timeTakenSec = Number(
        Math.max(1.8, Math.min(18.5, peer.baseSpeedSec + timeJitter)).toFixed(1)
      );
      totalTime += timeTakenSec;

      let selectedIndex: number = q.correctIndex;
      if (!isCorrect) {
        selectedIndex = (q.correctIndex + 1 + ((idx + qIdx) % 3)) % 4;
      }

      const pointsEarned = calculateQuestionScore(isCorrect, timeTakenSec, streak);
      if (isCorrect) {
        correctCount += 1;
        streak += 1;
        if (streak > maxStreak) maxStreak = streak;
      } else {
        streak = 0;
      }
      totalScore += pointsEarned;

      return {
        questionId: q.id,
        questionNumber: qIdx + 1,
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        timeTakenSec,
        pointsEarned,
      };
    });

    return {
      id: `peer-${peer.student.studentId}-${deck.id}`,
      isSimulated: true,
      student: peer.student,
      avatar: peer.avatar,
      deckId: deck.id,
      deckTitle: deck.title,
      totalScore,
      correctCount,
      totalQuestions: deck.questions.length,
      accuracyPercent: Math.round((correctCount / deck.questions.length) * 100),
      avgTimeSec: Number((totalTime / deck.questions.length).toFixed(1)),
      maxStreak,
      attempts,
      completedAt: now,
    };
  });
}
