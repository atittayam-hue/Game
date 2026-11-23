import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';
import {
  ACCESSORY_STYLES,
  AVATAR_BG_COLORS,
  EYE_STYLES,
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_COLORS,
  OUTFIT_STYLES,
  SKIN_COLORS,
  createRandomAvatar,
} from '../data/avatarOptions';
import { QUIZ_DECKS } from '../data/quizzes';
import { AvatarConfig, QuizDeck, StudentInfo } from '../types/game';
import { soundFX } from '../utils/sound';
import { AvatarSvg } from './AvatarSvg';

interface AvatarBuilderProps {
  student: StudentInfo;
  avatar: AvatarConfig;
  selectedDeckId: string;
  lockedDeck?: { title: string; subtitle: string };
  onChangeAvatar: (next: AvatarConfig) => void;
  onChangeDeck: (deckId: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

type StudioTab = 'hair' | 'face' | 'accessory' | 'outfit' | 'deck';

export const AvatarBuilder: React.FC<AvatarBuilderProps> = ({
  student,
  avatar,
  selectedDeckId,
  lockedDeck,
  onChangeAvatar,
  onChangeDeck,
  onBack,
  onConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('hair');

  const selectedDeck: QuizDeck =
    QUIZ_DECKS.find((d) => d.id === selectedDeckId) ?? QUIZ_DECKS[0];

  const handleRandomize = () => {
    soundFX.playClick();
    onChangeAvatar(createRandomAvatar());
  };

  const tabs: { id: StudioTab; label: string }[] = [
    { id: 'hair', label: 'ทรงผม' },
    { id: 'face', label: 'ใบหน้าและสีผิว' },
    { id: 'accessory', label: 'แว่นและอุปกรณ์' },
    { id: 'outfit', label: 'เสื้อผ้าและพื้นหลัง' },
    ...(lockedDeck ? [] : [{ id: 'deck' as StudioTab, label: 'เลือกชุดคำถาม' }]),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-700">
            ขั้นตอนที่ 2 จาก 3 · สร้างโปรไฟล์อวตาร
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            ปรับแต่งอวตารประจำตัวนักศึกษา
          </h1>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>แก้ไขข้อมูลนักศึกษา</span>
        </button>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left Profile Card Preview */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">ตัวอย่างบัตรโปรไฟล์ผู้เล่น</span>
              <button
                type="button"
                onClick={handleRandomize}
                className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <Shuffle className="h-3.5 w-3.5 text-indigo-600" />
                <span>สุ่มอวตาร</span>
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center text-center">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <AvatarSvg config={avatar} size={200} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">{student.nickname}</h2>
              <p className="mt-0.5 text-sm font-medium text-slate-700">{student.fullName}</p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="font-mono-tabular font-semibold text-slate-700">
                  รหัส {student.studentId}
                </span>
                <span aria-hidden="true">·</span>
                <span>{student.faculty}</span>
                <span aria-hidden="true">·</span>
                <span>{student.major}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {student.year} ({student.section || 'Sec 01'})
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-5">
            <div className="text-xs font-medium text-slate-500">
              {lockedDeck ? lockedDeck.subtitle : 'ชุดคำถามที่เลือกไว้'}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {lockedDeck ? lockedDeck.title : selectedDeck.title}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="tabular-nums">5 ข้อ</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">ข้อละ 20 วินาที</span>
              <span aria-hidden="true">·</span>
              <span>คำนวณคะแนนตามความเร็ว</span>
            </div>
          </div>
        </div>

        {/* Right Customization Controls */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-7">
          <div>
            {/* Segmented Tab Controls */}
            <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setActiveTab(tab.id);
                    }}
                    className={`min-h-[40px] flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 min-h-[300px]">
              {activeTab === 'hair' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">ทรงผม</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {HAIR_STYLES.map((item) => {
                        const selected = avatar.hairStyle === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onChangeAvatar({ ...avatar, hairStyle: item.id });
                            }}
                            className={`min-h-[44px] rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">สีผม</h3>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {HAIR_COLORS.map((c) => {
                        const selected = avatar.hairColor === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onChangeAvatar({ ...avatar, hairColor: c.id });
                            }}
                            className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-black/15"
                              style={{ backgroundColor: c.id }}
                            />
                            <span>{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'face' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">ดวงตาและสีหน้า</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {EYE_STYLES.map((item) => {
                        const selected = avatar.eyeStyle === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onChangeAvatar({ ...avatar, eyeStyle: item.id });
                            }}
                            className={`min-h-[44px] rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">โทนสีผิว</h3>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {SKIN_COLORS.map((c) => {
                        const selected = avatar.skinColor === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onChangeAvatar({ ...avatar, skinColor: c.id });
                            }}
                            className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-black/15"
                              style={{ backgroundColor: c.id }}
                            />
                            <span>{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'accessory' && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">แว่นตาและเครื่องประดับ</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {ACCESSORY_STYLES.map((item) => {
                      const selected = avatar.accessory === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            onChangeAvatar({ ...avatar, accessory: item.id });
                          }}
                          className={`min-h-[48px] rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                            selected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'outfit' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">ชุดนักศึกษา / เสื้อผ้า</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {OUTFIT_STYLES.map((item) => {
                        const selected = avatar.outfitStyle === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onChangeAvatar({ ...avatar, outfitStyle: item.id });
                            }}
                            className={`min-h-[44px] rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">สีเสื้อ</h3>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {OUTFIT_COLORS.map((c) => {
                        const selected = avatar.outfitColor === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onChangeAvatar({ ...avatar, outfitColor: c.id });
                            }}
                            className={`flex min-h-[40px] items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-black/15"
                              style={{ backgroundColor: c.id }}
                            />
                            <span>{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">สีพื้นหลังโปรไฟล์</h3>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {AVATAR_BG_COLORS.map((c) => {
                        const selected = avatar.bgColor === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onChangeAvatar({ ...avatar, bgColor: c.id });
                            }}
                            className={`flex min-h-[40px] items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-black/15"
                              style={{ backgroundColor: c.id }}
                            />
                            <span>{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'deck' && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">เลือกหมวดคำถามสำหรับแข่งขัน (5 ข้อ)</h3>
                  <div className="mt-3 space-y-3">
                    {QUIZ_DECKS.map((deck) => {
                      const selected = deck.id === selectedDeckId;
                      return (
                        <button
                          key={deck.id}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            onChangeDeck(deck.id);
                          }}
                          className={`w-full rounded-xl border p-4 text-left transition-colors ${
                            selected
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold text-slate-900">
                              {deck.title}
                            </span>
                            <span className="font-mono-tabular text-xs font-medium text-indigo-700 whitespace-nowrap">
                              5 ข้อ · 20 วิ/ข้อ
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{deck.subtitle}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <span className="text-xs text-slate-500">
              บันทึกอวตารแล้วเข้าสู่ห้องรอเริ่มเกม
            </span>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onConfirm();
              }}
              className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 whitespace-nowrap shrink-0"
            >
              <span>บันทึกโปรไฟล์และเข้าห้องเกม</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
