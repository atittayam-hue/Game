import React, { useState } from 'react';
import { ArrowRight, UserCheck, Users } from 'lucide-react';
import { StudentInfo } from '../types/game';
import { soundFX } from '../utils/sound';

interface RegistrationFormProps {
  initialStudent: StudentInfo;
  recordedStudentsCount: number;
  onSubmit: (info: StudentInfo) => void;
  onOpenExistingResults?: () => void;
}

const FACULTY_PRESETS = [
  'คณะวิศวกรรมศาสตร์',
  'คณะวิทยาศาสตร์และเทคโนโลยี',
  'คณะเทคโนโลยีสารสนเทศ',
  'คณะบริหารธุรกิจ',
  'คณะนิเทศศาสตร์',
  'คณะศิลปศาสตร์',
  'คณะศึกษาศาสตร์',
];

const YEAR_OPTIONS = ['ปี 1', 'ปี 2', 'ปี 3', 'ปี 4', 'บัณฑิตศึกษา'];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  initialStudent,
  recordedStudentsCount,
  onSubmit,
  onOpenExistingResults,
}) => {
  const [form, setForm] = useState<StudentInfo>(initialStudent);
  const [errors, setErrors] = useState<Partial<Record<keyof StudentInfo, string>>>({});

  const updateField = (field: keyof StudentInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof StudentInfo, string>> = {};
    if (!form.studentId.trim()) {
      nextErrors.studentId = 'กรุณากรอกรหัสนักศึกษา';
    } else if (form.studentId.trim().length < 4) {
      nextErrors.studentId = 'รหัสนักศึกษาควรมีอย่างน้อย 4 ตัวอักษร';
    }
    if (!form.fullName.trim()) {
      nextErrors.fullName = 'กรุณากรอกชื่อ - นามสกุล';
    }
    if (!form.nickname.trim()) {
      nextErrors.nickname = 'กรุณากรอกชื่อเล่นสำหรับแสดงบนตารางอันดับ';
    }
    if (!form.faculty.trim()) {
      nextErrors.faculty = 'กรุณาเลือกหรือกรอกชื่อคณะ';
    }
    if (!form.major.trim()) {
      nextErrors.major = 'กรุณากรอกสาขาวิชา';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    soundFX.playClick();
    onSubmit({
      studentId: form.studentId.trim(),
      fullName: form.fullName.trim(),
      nickname: form.nickname.trim(),
      faculty: form.faculty.trim(),
      major: form.major.trim(),
      year: form.year,
      section: form.section.trim() || 'Sec 01',
    });
  };

  const handleFillSample = () => {
    soundFX.playClick();
    setForm({
      studentId: '67010428',
      fullName: 'อทิตยา มณีโชติ',
      nickname: 'มิว',
      faculty: 'คณะเทคโนโลยีสารสนเทศ',
      major: 'วิทยาการคอมพิวเตอร์',
      year: 'ปี 2',
      section: 'Sec 01',
    });
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left Context Column */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 lg:col-span-5">
          <div>
            <p className="text-xs font-semibold tracking-wide text-indigo-700">
              ขั้นตอนที่ 1 จาก 3 · ลงทะเบียนนักศึกษา
            </p>
            <h1
              className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              เกมตอบคำถามห้องเรียน พร้อมโปรไฟล์อวตารและการบันทึกผล
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              กรอกข้อมูลนักศึกษาเพื่อใช้บันทึกผลคะแนนและอันดับการแข่งขัน จากนั้นปรับแต่งอวตารประจำตัวก่อนเข้าสู่สนามตอบคำถาม
            </p>

            <div className="mt-8 space-y-5 border-t border-slate-100 pt-6">
              <div className="flex items-start gap-4">
                <span className="font-mono-tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-800">
                  01
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">บันทึกข้อมูลนักศึกษา</h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    ระบุรหัสนักศึกษา ชื่อ-นามสกุล คณะ และสาขาวิชาให้ครบถ้วน
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-mono-tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-800">
                  02
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">สร้างโปรไฟล์อวตาร</h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    เลือกทรงผม สีหน้า แว่นตา เสื้อผ้า และชุดคำถามก่อนเข้าห้องแข่งขัน
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-mono-tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-800">
                  03
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">แข่งขัน 5 ข้อ ข้อละ 20 วินาที</h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    ตอบไวได้คะแนนสูง ดูอันดับบนโพเดียม และดาวน์โหลดข้อมูลเป็นไฟล์ CSV
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">5</div>
                <div className="text-xs text-slate-500">คำถามต่อรอบ</div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">20s</div>
                <div className="text-xs text-slate-500">เวลาต่อข้อ</div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">CSV</div>
                <div className="text-xs text-slate-500">ส่งออกรายงาน</div>
              </div>
            </div>

            {recordedStudentsCount > 0 && onOpenExistingResults && (
              <button
                type="button"
                onClick={onOpenExistingResults}
                className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Users className="h-4 w-4 text-indigo-600" />
                <span>ดูตารางอันดับที่บันทึกไว้ ({recordedStudentsCount} คน)</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Form Column */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">ข้อมูลนักศึกษา</h2>
              <p className="mt-1 text-sm text-slate-500">
                ข้อมูลนี้จะนำไปแสดงในโปรไฟล์อวตาร ตารางอันดับ และไฟล์ CSV
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillSample}
              className="min-h-[40px] rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              กรอกข้อมูลตัวอย่าง
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-slate-700">
                  รหัสนักศึกษา <span className="text-red-600">*</span>
                </label>
                <input
                  id="studentId"
                  type="text"
                  inputMode="numeric"
                  value={form.studentId}
                  onChange={(e) => updateField('studentId', e.target.value)}
                  placeholder="เช่น 67010428"
                  className={`font-mono-tabular mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.studentId
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                {errors.studentId && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.studentId}</p>
                )}
              </div>

              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-slate-700">
                  ชื่อเล่นในเกม <span className="text-red-600">*</span>
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={form.nickname}
                  onChange={(e) => updateField('nickname', e.target.value)}
                  placeholder="เช่น มิว, ต้นกล้า"
                  className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.nickname
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                {errors.nickname && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.nickname}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                ชื่อ - นามสกุล <span className="text-red-600">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="เช่น อทิตยา มณีโชติ"
                className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="faculty" className="block text-sm font-medium text-slate-700">
                  คณะ <span className="text-red-600">*</span>
                </label>
                <input
                  id="faculty"
                  type="text"
                  list="faculty-options"
                  value={form.faculty}
                  onChange={(e) => updateField('faculty', e.target.value)}
                  placeholder="เลือกหรือพิมพ์ชื่อคณะ"
                  className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.faculty
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                <datalist id="faculty-options">
                  {FACULTY_PRESETS.map((fac) => (
                    <option key={fac} value={fac} />
                  ))}
                </datalist>
                {errors.faculty && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.faculty}</p>
                )}
              </div>

              <div>
                <label htmlFor="major" className="block text-sm font-medium text-slate-700">
                  สาขาวิชา <span className="text-red-600">*</span>
                </label>
                <input
                  id="major"
                  type="text"
                  value={form.major}
                  onChange={(e) => updateField('major', e.target.value)}
                  placeholder="เช่น วิทยาการคอมพิวเตอร์"
                  className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.major
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                {errors.major && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.major}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <span className="block text-sm font-medium text-slate-700">ชั้นปี</span>
                <div className="mt-1.5 grid grid-cols-5 gap-1.5 rounded-xl bg-slate-100 p-1">
                  {YEAR_OPTIONS.map((yr) => {
                    const active = form.year === yr;
                    const shortLabel = yr === 'บัณฑิตศึกษา' ? 'ป.โท/เอก' : yr;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => updateField('year', yr)}
                        className={`min-h-[40px] rounded-lg px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="section" className="block text-sm font-medium text-slate-700">
                  กลุ่มเรียน (Section)
                </label>
                <input
                  id="section"
                  type="text"
                  value={form.section}
                  onChange={(e) => updateField('section', e.target.value)}
                  placeholder="เช่น Sec 01 หรือ กลุ่ม A"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>ข้อมูลจะบันทึกพร้อมผลคะแนนเพื่อส่งออก CSV</span>
              </div>

              <button
                type="submit"
                className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 whitespace-nowrap shrink-0"
              >
                <span>ไปสร้างโปรไฟล์อวตาร</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
