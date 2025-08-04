# Zwiz API Script Runner

เว็บไซต์สำหรับการ run script ที่ส่ง request ไปยัง Zwiz API โดยใช้ Next.js, TypeScript และ Tailwind CSS

## คุณสมบัติ

### 🚀 Single Run (ส่งรายการเดียว)
- ✅ Form สำหรับกรอกข้อมูล parameters
- ✅ การส่ง request ไปยัง Zwiz API
- ✅ แสดงผลลัพธ์ที่ได้รับจาก API
- ✅ แสดง loading state ขณะรอผลลัพธ์
- ✅ แสดง error handling
- ✅ UI ที่สวยงามด้วย Tailwind CSS

### 📊 CSV Batch Run (ส่งจาก CSV หลายรายการ)
- ✅ อัพโหลดไฟล์ CSV
- ✅ แปลงข้อมูลอัตโนมัติตาม format ที่ต้องการ
- ✅ Preview ข้อมูลก่อนส่ง
- ✅ ส่งข้อมูลหลายๆ รายการพร้อมกัน (Batch Processing)
- ✅ แสดง progress และสถานะของแต่ละรายการ
- ✅ สรุปผลการส่งทั้งหมด (สำเร็จ/ล้มเหลว)

## การติดตั้งและรัน

1. **เข้าไปใน directory ของโปรเจค:**
   ```bash
   cd script-ai
   ```

2. **รัน development server:**
   ```bash
   npm run dev
   ```

3. **เปิดเบราว์เซอร์และไปที่:**
   ```
   http://localhost:3000
   ```

## การใช้งาน

1. **กรอกข้อมูลในฟอร์ม:**
   - **Page ID:** ID ของหน้า (default: 619831537888082)
   - **Intent Name:** ชื่อ intent (default: test01)
   - **Authorization Token:** ค่า token หลังจาก "BEARER jm_admin01 " (default: zqyp3szoqa3b70ypcoyr4)
   - **Question Value:** ค่าคำถาม (default: 01,02,includes(03),includes(04))
   - **Answer Value (JSON):** ค่าคำตอบในรูปแบบ JSON (default: [[{"text":"oooooooo","type":"text"}]])

2. **กดปุ่ม "Run Script"** เพื่อส่ง request

3. **ดูผลลัพธ์** ที่แสดงด้านล่างฟอร์ม:
   - หากสำเร็จ: จะแสดงข้อมูลที่ได้รับจาก API
   - หากเกิดข้อผิดพลาด: จะแสดงข้อความ error

### 📊 การใช้งาน CSV Batch Upload

1. **คลิกที่แท็บ "ส่งจาก CSV (Batch Run)"**

2. **เตรียมไฟล์ CSV ตามรูปแบบที่กำหนด:**
   ```csv
   Conversation ID,Conversation Name,Sentence Rule,Keyword Rule,Message
   TEST001,ทดสอบ01,สวัสดี|hello,ช่วยเหลือ&&ลูกค้า|เกี่ยวกับ&&สินค้า,ข้อความตอบกลับของคุณ
   ```

3. **เลือกไฟล์ CSV และดู Preview:**
   - ระบบจะแสดงการแปลงข้อมูลอัตโนมัติ
   - ตรวจสอบความถูกต้องของข้อมูลก่อนส่ง

4. **กดปุ่ม "ส่งทั้งหมด":**
   - ระบบจะส่งข้อมูลทีละรายการ
   - แสดง progress real-time
   - สรุปผลการส่งเมื่อเสร็จสิ้น

### 🔄 การแปลงข้อมูล CSV อัตโนมัติ

- **Conversation Name** → **Intent Name**
- **Sentence Rule**: แปลง `|` เป็น `,`
- **Keyword Rule**: แปลง `|` เป็น `,` และใส่ `includes()` รอบแต่ละส่วน
- **Message** → JSON format `[[{"text":"message","type":"text"}]]`

**ตัวอย่าง:**
```
Input:  ช่วยเหลือ&&ลูกค้า|เกี่ยวกับ&&สินค้า
Output: includes(ช่วยเหลือ&&ลูกค้า),includes(เกี่ยวกับ&&สินค้า)
```

## โครงสร้างโปรเจค

```
script-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── run-script/
│   │   │   │   └── route.ts      # API route สำหรับส่ง request เดียว
│   │   │   └── batch-run/
│   │   │       └── route.ts      # API route สำหรับ batch processing
│   │   ├── globals.css           # Tailwind CSS styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # หน้าหลักพร้อม tab system
│   ├── components/
│   │   └── CSVBatchUploader.tsx  # Component สำหรับ CSV upload
│   ├── types/
│   │   ├── api.ts                # TypeScript types สำหรับ API
│   │   └── csv.ts                # TypeScript types สำหรับ CSV
│   └── utils/
│       └── csvProcessor.ts       # Functions สำหรับ process CSV
├── example-data.csv              # ไฟล์ตัวอย่าง CSV สำหรับทดสอบ
├── package.json
└── README.md
```

## API Routes

### Single Run
- **Endpoint:** `/api/run-script`
- **Method:** POST
- **Body:** JSON object ที่มี pageid, intentname, q_val, a_val, authToken

### Batch Run
- **Endpoint:** `/api/batch-run`
- **Method:** POST
- **Body:** JSON object ที่มี rows[], authToken, pageid

## ไฟล์ตัวอย่าง

ใช้ไฟล์ `example-data.csv` ที่มีในโปรเจคสำหรับทดสอบ CSV batch upload:
- รวม 4 รายการตัวอย่าง
- ครอบคลุมการใช้งาน Sentence Rule และ Keyword Rule
- แสดงรูปแบบข้อความที่หลากหลาย

## ⚠️ การแก้ไขปัญหา CSV

### ปัญหาที่อาจพบ
1. **"Invalid CSV format at line X"** - บรรทัดที่ไม่สมบูรณ์หรือ format ผิด
2. **ข้อมูลบางส่วนหายไป** - เกิดจาก multiline text ใน Message
3. **Encoding ผิด** - ตัวอักษรไทยแสดงผิด

### วิธีแก้ไข
✅ **ระบบจัดการอัตโนมัติ:**
- ข้ามบรรทัดที่อ่านไม่ได้
- รวม multiline text ให้เป็น single line
- แสดงสถิติการอ่านไฟล์ที่ละเอียด
- ใช้เฉพาะบรรทัดที่ถูกต้อง

🛠️ **การเตรียมไฟล์ CSV ที่ดี:**
1. ใช้ encoding UTF-8
2. ครอบข้อความที่มี comma/newline ด้วย quotes
3. หลีกเลี่ยง line breaks ใน Message field
4. ตรวจสอบจำนวน columns ให้ครบ 5 columns

## Original cURL Command

เว็บไซต์นี้ถูกสร้างขึ้นเพื่อ run script ต่อไปนี้:

```bash
curl 'https://api-enterprise.zwiz.app/intents' \\
  -H 'accept: */*' \\
  -H 'accept-language: th-TH,th;q=0.9,en;q=0.8' \\
  -H 'authorization: BEARER jm_admin01 zqyp3szoqa3b70ypcoyr4' \\
  -H 'content-type: application/json' \\
  -H 'origin: https://demo.enterprise.zwiz.app' \\
  -H 'referer: https://demo.enterprise.zwiz.app/' \\
  --data-raw '{"pageid":"619831537888082","intentname":"test01","q_type":"text","a_type":"json","q_val":"01,02,includes(03),includes(04)","a_val":"[[{\\"text\\":\\"oooooooo\\",\\"type\\":\\"text\\"}]]","context_in":"","context_out":"","postidlist":"","userstatus":"","usertags":"","isShow":true,"linenoti_status":false,"linenoti_text":null,"starttime":null,"endtime":null,"intentstatus":true,"follow_up_fb_quick_reply":"","follow_up_fb_val":null,"follow_up_ig_quick_reply":null,"follow_up_ig_val":null,"follow_up_line_quick_reply":"","follow_up_line_val":null,"follow_up_quick_reply":null,"follow_up_status":null,"follow_up_type":"json","follow_up_val":"[[]]","follow_up_within_seconds":null,"follow_up_whatsapp_quick_reply":null,"follow_up_whatsapp_val":null,"time_setting":null,"exceptpostidlist":"","post_keywords":"","onlytime":false,"quick_reply":"","follow_up_intentgroup":{"assigngroupid":null,"assignsubgroupid":null,"priority":null,"duedate":null,"day":null,"hour":null,"minute":null,"mood":null,"wrap_up":null,"wrap_up_route":null,"tags":null},"user_tags_delete":"","follow_up_usertags":"","intentgroup":{"assigngroupid":null,"assignsubgroupid":null,"priority":null,"duedate":null,"day":null,"hour":null,"minute":null,"mood":null,"wrap_up":null,"wrap_up_route":null,"tags":null}}'
```

## เทคโนโลยีที่ใช้

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hooks** - State management

## หมายเหตุ

- ✅ **สามารถกรอก authorization token เองได้ในฟอร์ม** - ไม่จำเป็นต้องแก้ไขโค้ด
- ✅ **รองรับการส่งข้อมูลทั้งแบบ single และ batch** - เลือกได้ตามความต้องการ
- ✅ **CSV Batch Processing พร้อม real-time progress tracking**
- เว็บไซต์จะแสดง cURL command ที่ generate ขึ้นตามค่าที่กรอกในฟอร์ม
- หากต้องการเปลี่ยน API endpoint สามารถแก้ไขได้ในไฟล์ `src/app/api/*/route.ts`
- ระบบจะเพิ่ม delay 100ms ระหว่างการส่งแต่ละ request ใน batch เพื่อป้องกัน API overload