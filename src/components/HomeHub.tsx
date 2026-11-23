import React, { useState } from 'react';
import { ArrowRight, Presentation, User, Users } from 'lucide-react';
import { soundFX } from '../utils/sound';

interface HomeHubProps {
  onSelectHost: () => void;
  onJoinWithPin: (pin: string) => void;
  onSelectSolo: () => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({
  onSelectHost,
  onJoinWithPin,
  onSelectSolo,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pinInput.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length !== 6) {
      setPinError('กรุณากรอกรหัส PIN 6 หลักให้ครบถ้วน');
      return;
    }
    setCheckingPin(true);
    setPinError(null);
    try {
      const res = await fetch(`/api/rooms/${cleaned}`);
      if (!res.ok) {
        setPinError('ไม่พบห้องเรียนหมายเลข PIN นี้ กรุณาตรวจสอบกับอาจารย์ผู้สอน');
        setCheckingPin(false);
        return;
      }
      const data = (await res.json()) as { phase: string };
      if (data.phase !== 'LOBBY') {
        setPinError('ห้องนี้กำลังแข่งขันอยู่ กรุณารออาจารย์เปิดรอบถัดไป');
        setCheckingPin(false);
        return;
      }
      soundFX.playClick();
      onJoinWithPin(cleaned);
    } catch {
      setPinError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setCheckingPin(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold tracking-wide text-indigo-700">
          เกมตอบคำถามห้องเรียนแบบเรียลไทม์ · 5 ข้อ ข้อละ 20 วินาที
        </p>
        <h1
          className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          style={{ textWrap: 'balance' }}
        >
          แข่งขันตอบคำถามพร้อมกันทั้งห้องเรียนด้วยรหัส PIN
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          อาจารย์เปิดห้องเพื่อรับรหัส PIN 6 หลัก ให้นักศึกษาทุกคนลงทะเบียนกรอกข้อมูล สร้างอวตาร และตอบคำถามพร้อมกันแบบเรียลไทม์ พร้อมสรุปโพเดียมและดาวน์โหลดผลเป็นไฟล์ CSV
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Primary Student Join Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 lg:col-span-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">สำหรับนักศึกษา: เข้าร่วมห้องเรียน</h2>
                <p className="text-xs text-slate-500">
                  ใส่ PIN 6 หลัก → กรอกข้อมูลนักศึกษา → สร้างอวตาร
                </p>
              </div>
            </div>

            <form onSubmit={handleJoinSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="home-pin-input" className="block text-sm font-medium text-slate-700">
                  รหัสห้องเรียน (Game PIN 6 หลัก)
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="home-pin-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                      if (pinError) setPinError(null);
                    }}
                    placeholder="เช่น 482910"
                    className="font-mono-tabular min-h-[48px] flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.25em] text-slate-900 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="submit"
                    disabled={checkingPin}
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 whitespace-nowrap shrink-0"
                  >
                    <span>{checkingPin ? 'กำลังตรวจสอบ...' : 'เข้าห้องเรียน'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {pinError && (
                  <p className="mt-2 text-xs font-medium text-red-600">{pinError}</p>
                )}
              </div>
            </form>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
            เข้าใช้งานได้พร้อมกันหลายเครื่องทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์
          </div>
        </div>

        {/* Host & Solo Cards */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          <div className="flex flex-1 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Presentation className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    สำหรับอาจารย์ / ผู้คุมห้อง (Host)
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    สร้างห้องแข่งขันรับรหัส PIN คุมเวลาเริ่มทั้ง 5 ข้อ เห็นนักศึกษาเข้าห้องแบบสด ๆ และส่งออก CSV รวมทั้งห้อง
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSelectHost();
                }}
                className="flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <span>เปิดห้องแข่งขันใหม่</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">โหมดฝึกซ้อมคนเดียว (Solo)</h2>
                <p className="mt-1 text-sm text-slate-600">
                  เล่นทดสอบคนเดียวบนเครื่องนี้โดยไม่ต้องเปิดห้อง PIN พร้อมผู้ร่วมแข่งขันจำลอง 5 คนและส่งออก CSV
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSelectSolo();
                }}
                className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <span>เล่นโหมดฝึกซ้อม</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
