# โครงสร้างแบบฟอร์มเสนอโครงการด้าน IT (5 Steps)

โครงสร้างนี้ออกแบบมาเพื่อรองรับ React Hook Form (RHF) และ Zod โดยแบ่งข้อมูลตามบริบทเพื่อลดความซับซ้อนในแต่ละหน้า และใช้ `array` สำหรับข้อมูลที่เป็นตารางแบบ Dynamic

---

## Step 1: ข้อมูลเบื้องต้นและภาพรวม (General Information)
ส่วนนี้ใช้สำหรับเก็บข้อมูลพื้นฐานของโครงการและส่วนราชการที่รับผิดชอบ

| ชื่อฟิลด์ (Field Name) | คำอธิบาย (Description) | Data Type (TypeScript / Zod) | รูปแบบ UI ที่แนะนำ |
| :--- | :--- | :--- | :--- |
| `projectName` | ชื่อโครงการ | `string` | Text Input |
| `agencyName` | ชื่อหน่วยงาน | `string` | Text Input / Select |
| `headOfAgency` | หัวหน้าส่วนราชการ | `string` | Text Input |
| `dcioName` | ผู้บริหารเทคโนโลยีสารสนเทศ (DCIO) | `string` | Text Input |
| `projectManager` | ผู้รับผิดชอบโครงการ | `string` | Text Input |
| `totalBudget` | วงเงินงบประมาณทั้งโครงการ (บาท) | `number` | Number Input (`z.coerce.number()`) |
| `budgetsByYear` | ตารางงบประมาณประจำปี | `array` | Dynamic Table (`useFieldArray`) |

**โครงสร้างย่อยของ `budgetsByYear` (Array of Objects):**
- `year` (พ.ศ.): `string`
- `amount` (จำนวนเงิน): `number`
- `budgetType` (ประเภทงบประมาณ): `enum` หรือ `string` (เช่น งบรายจ่ายประจำปี, งบกลาง)

---

## Step 2: สาระสำคัญและขอบเขตโครงการ (Context & Scope)
ส่วนนี้ใช้สำหรับบรรยายเนื้อหาที่มาและสิ่งที่โครงการจะทำ รวมถึงข้อมูลสภาพปัจจุบัน

| ชื่อฟิลด์ (Field Name) | คำอธิบาย (Description) | Data Type (TypeScript / Zod) | รูปแบบ UI ที่แนะนำ |
| :--- | :--- | :--- | :--- |
| `background` | หลักการและเหตุผล / ความเป็นมา | `string` | Textarea |
| `objective` | วัตถุประสงค์ | `string` | Textarea |
| `target` | เป้าหมาย | `string` | Textarea |
| `scope` | ขอบเขตการดำเนินงาน | `string` | Textarea |
| `projectType` | ลักษณะโครงการ | `enum` | Radio Button (จัดหาใหม่, ทดแทน, ต่อเนื่อง) |
| `relatedProjects` | โครงการที่เกี่ยวข้อง | `array` | Dynamic Table |
| `currentSystemStatus` | สถานภาพระบบงานคอมพิวเตอร์ปัจจุบัน | `string` | Textarea |
| `currentProblems` | สภาพปัญหาของผู้รับบริการ/เหตุผลความจำเป็น | `string` | Textarea |
| `currentStaffing` | ตารางแสดงอัตรากำลังของหน่วยงาน | `array` | Dynamic Table |
| `currentHardware` | ตารางแสดงรายการครุภัณฑ์ที่มีอยู่ปัจจุบัน | `array` | Dynamic Table |

**โครงสร้างย่อยของ `relatedProjects`:** `projectName` (string), `agency` (string), `year` (string), `relationType` (string)
**โครงสร้างย่อยของ `currentStaffing`:** `agencyName` (string), `totalPositions` (number), `occupied` (number), `vacant` (number)
**โครงสร้างย่อยของ `currentHardware`:** `itemName` (string), `lifespan` (number), `quantity` (number), `users` (string), `location` (string)

---

## Step 3: สถาปัตยกรรมองค์กร (Enterprise Architecture)
ส่วนนี้เก็บข้อมูลเชิงนโยบาย การบูรณาการข้อมูล และการแนบไฟล์แผนภาพ (Diagram) เชิงเทคนิค

| ชื่อฟิลด์ (Field Name) | คำอธิบาย (Description) | Data Type (TypeScript / Zod) | รูปแบบ UI ที่แนะนำ |
| :--- | :--- | :--- | :--- |
| `strategicAlignments`| ความสอดคล้องเชิงยุทธศาสตร์ | `array` of `string` | Checkbox Group (เลือกได้หลายข้อ) |
| `policyCode` | รหัสนโยบายผู้ว่าฯ (ถ้ามี) | `string` (optional) | Text Input |
| `obstacleLaws` | ระเบียบ/กฎหมาย/ข้อบังคับที่เป็นอุปสรรค | `string` | Textarea |
| `appArchitecture` | ด้านระบบสารสนเทศ (Application) | `string` | Textarea |
| `dataOwner` | ชื่อหน่วยงานเจ้าของข้อมูล | `string` | Text Input |
| `dataExchangePlan` | แนวทางการแลกเปลี่ยน/นำเข้าข้อมูล | `string` | Textarea |
| `systemDiagram` | แผนผังการเชื่อมโยงระบบ | `array` of `File` | File Uploader (จำกัดไฟล์รูป/PDF) |
| `networkDiagram` | แผนผังเครือข่าย | `array` of `File` | File Uploader |
| `useCaseDiagram` | แผนภาพ Use Case | `array` of `File` | File Uploader |
| `securityDiagram` | แผนภาพ Security | `array` of `File` | File Uploader |

---

## Step 4: แผนงานและรายละเอียดงบประมาณ (Budget Breakdown)
ส่วนนี้มีความซับซ้อนสูงสุด เน้นใช้ `array` เพื่อสร้าง Dynamic Table ทั้งหมด

| ชื่อฟิลด์ (Field Name) | คำอธิบาย (Description) | Data Type (TypeScript / Zod) | รูปแบบ UI ที่แนะนำ |
| :--- | :--- | :--- | :--- |
| `budgetProportions` | สัดส่วนงบประมาณ IT และ Non-IT | `array` | ตารางสรุป (Auto-calculate จากหมวดอื่นได้) |
| `hardwareCosts` | หมวด 1: ค่าใช้จ่ายครุภัณฑ์ | `array` | Dynamic Table |
| `softwareCosts` | หมวด 2: ค่าใช้จ่ายซอฟต์แวร์ | `array` | Dynamic Table |
| `personnelCosts` | หมวด 3: ค่าใช้จ่ายบุคลากร | `array` | Dynamic Table (หลัก, ผู้ช่วย, สนับสนุน) |
| `personnelRoles` | หน้าที่ความรับผิดชอบของบุคลากร | `array` | Dynamic Table |
| `trainingCourses` | หมวด 4: ค่าใช้จ่ายการฝึกอบรม (หลักสูตร) | `array` | Dynamic Table |
| `trainerCosts` | หมวด 4: ค่าสมนาคุณวิทยากร | `array` | Dynamic Table |
| `foodCosts` | หมวด 4: ค่าอาหารและเครื่องดื่ม | `array` | Dynamic Table |
| `otherCosts` | หมวด 5: ค่าใช้จ่ายอื่นๆ | `array` | Dynamic Table |

**ตัวอย่างโครงสร้างย่อยของตารางที่มีการคำนวณ (`personnelCosts`):**
- `roleLevel` (ระดับ: หลัก/ผู้ช่วย/สนับสนุน): `enum`
- `position` (ตำแหน่ง): `string`
- `education` (วุฒิ): `string`
- `experienceYears` (อายุงาน): `number`
- `baseSalary` (อัตราเงินเดือนพื้นฐาน): `number`
- `multiplier` (ตัวคูณ): `number`
- `personCount` (จำนวนคน): `number`
- `durationMonths` (ระยะเวลา/เดือน): `number`
- `totalLineCost` (รวมบาท): `number` *(ควรเป็น Auto-calculated field ในฝั่ง UI)*

---

## Step 5: ความพร้อม ผลสัมฤทธิ์ และเอกสารแนบ (Readiness & Attachments)
ส่วนสุดท้ายสำหรับการตรวจสอบความพร้อม แนบเอกสารนำเสนอ และข้อมูลผู้ติดต่อ

| ชื่อฟิลด์ (Field Name) | คำอธิบาย (Description) | Data Type (TypeScript / Zod) | รูปแบบ UI ที่แนะนำ |
| :--- | :--- | :--- | :--- |
| `operationDuration` | ระยะเวลาดำเนินงาน (วัน) | `number` | Number Input |
| `currentIctStaff` | บุคลากร ICT ที่มีอยู่ในปัจจุบัน | `array` | Dynamic Table |
| `otherReadiness` | ประเด็นความพร้อมด้านอื่นๆ | `string` (optional) | Textarea |
| `expectedBenefits` | ประโยชน์ที่คาดว่าจะได้รับ | `string` | Textarea |
| `onePageSummary` | เอกสารสรุปโครงการ One Page | `array` of `File` | File Uploader (PDF) |
| `beforeAfterDoc` | เอกสาร Before and After | `array` of `File` | File Uploader (PDF/PPT) |
| `submitterName` | ชื่อผู้เสนอโครงการ | `string` | Text Input |
| `submitterPosition` | ตำแหน่ง | `string` | Text Input |
| `submitterAgency` | หน่วยงาน | `string` | Text Input |
| `submitterPhone` | โทรศัพท์ | `string` | Tel Input |
| `submitterFax` | โทรสาร | `string` (optional) | Tel Input |
| `submitterEmail` | อีเมล | `string` | Email Input (`z.string().email()`) |