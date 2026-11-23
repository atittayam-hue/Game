import {
  AccessoryStyle,
  AvatarConfig,
  EyeStyle,
  HairStyle,
  OutfitStyle,
} from '../types/game';

export const AVATAR_BG_COLORS = [
  { id: '#E0E7FF', label: 'ครามอ่อน' },
  { id: '#DBEAFE', label: 'ฟ้าสดใส' },
  { id: '#D1FAE5', label: 'เขียวมิ้นท์' },
  { id: '#FEF3C7', label: 'เหลืองอบอุ่น' },
  { id: '#FCE7F3', label: 'ชมพูพาสเทล' },
  { id: '#EDE9FE', label: 'ม่วงลาเวนเดอร์' },
  { id: '#E2E8F0', label: 'เทาหินอ่อน' },
  { id: '#FFE4E6', label: 'โรสอ่อน' },
];

export const SKIN_COLORS = [
  { id: '#FCE4D6', label: 'สว่าง' },
  { id: '#F6DCC3', label: 'ขาวเหลือง' },
  { id: '#F3D2B3', label: 'น้ำผึ้งอ่อน' },
  { id: '#E5B88E', label: 'แทน' },
  { id: '#C68B59', label: 'น้ำตาลทอง' },
  { id: '#8D5524', label: 'เข้ม' },
];

export const HAIR_COLORS = [
  { id: '#18181B', label: 'ดำขลับ' },
  { id: '#3F271E', label: 'น้ำตาลเข้ม' },
  { id: '#6B4423', label: 'น้ำตาลคาราเมล' },
  { id: '#B45309', label: 'ทองแดง' },
  { id: '#312E81', label: 'น้ำเงินกรม' },
  { id: '#7C2D12', label: 'เบอร์กันดี' },
  { id: '#64748B', label: 'เทาซิลเวอร์' },
];

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'short', label: 'ผมสั้นเรียบร้อย' },
  { id: 'sidePart', label: 'ปัดข้าง' },
  { id: 'spiky', label: 'ตั้งเท่' },
  { id: 'curly', label: 'หยิกฟู' },
  { id: 'bob', label: 'บ๊อบสั้น' },
  { id: 'long', label: 'ผมยาวตรง' },
  { id: 'ponytail', label: 'หางม้า' },
  { id: 'bun', label: 'มวยผม' },
];

export const EYE_STYLES: { id: EyeStyle; label: string }[] = [
  { id: 'normal', label: 'ยิ้มเป็นมิตร' },
  { id: 'happy', label: 'ตาหยีร่าเริง' },
  { id: 'focused', label: 'มุ่งมั่น' },
  { id: 'sparkle', label: 'สดใสเป็นประกาย' },
  { id: 'wink', label: 'ขยิบตา' },
];

export const ACCESSORY_STYLES: { id: AccessoryStyle; label: string }[] = [
  { id: 'none', label: 'ไม่ใส่' },
  { id: 'roundGlasses', label: 'แว่นกลม' },
  { id: 'squareGlasses', label: 'แว่นเหลี่ยม' },
  { id: 'headphones', label: 'หูฟังครอบหู' },
  { id: 'gradCap', label: 'หมวกรับปริญญา' },
  { id: 'headband', label: 'ที่คาดผม' },
];

export const OUTFIT_STYLES: { id: OutfitStyle; label: string }[] = [
  { id: 'polo', label: 'เสื้อโปโลนักศึกษา' },
  { id: 'tshirt', label: 'เสื้อยืดคอกลม' },
  { id: 'hoodie', label: 'ฮู้ดดี้' },
  { id: 'blazer', label: 'เบลเซอร์สูท' },
  { id: 'varsity', label: 'แจ็คเก็ตมหาลัย' },
];

export const OUTFIT_COLORS = [
  { id: '#312E81', label: 'กรมท่า' },
  { id: '#2563EB', label: 'น้ำเงิน' },
  { id: '#059669', label: 'เขียวมรกต' },
  { id: '#DC2626', label: 'แดงเข้ม' },
  { id: '#D97706', label: 'เหลืองอำพัน' },
  { id: '#334155', label: 'เทาเข้ม' },
  { id: '#7C3AED', label: 'ม่วง' },
];

export const DEFAULT_AVATAR: AvatarConfig = {
  bgColor: '#E0E7FF',
  skinColor: '#F3D2B3',
  hairStyle: 'sidePart',
  hairColor: '#18181B',
  eyeStyle: 'normal',
  accessory: 'none',
  outfitStyle: 'polo',
  outfitColor: '#312E81',
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createRandomAvatar(): AvatarConfig {
  return {
    bgColor: pickRandom(AVATAR_BG_COLORS).id,
    skinColor: pickRandom(SKIN_COLORS).id,
    hairStyle: pickRandom(HAIR_STYLES).id,
    hairColor: pickRandom(HAIR_COLORS).id,
    eyeStyle: pickRandom(EYE_STYLES).id,
    accessory: pickRandom(ACCESSORY_STYLES).id,
    outfitStyle: pickRandom(OUTFIT_STYLES).id,
    outfitColor: pickRandom(OUTFIT_COLORS).id,
  };
}
