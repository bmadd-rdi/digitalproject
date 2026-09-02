// src/features/meetings/data/mock-meetings.ts
// ข้อมูลจำลองสำหรับระบบจัดการการประชุมและมติ — Thai Government Mock Data

import {
  type Meeting,
  type Agenda,
  type Resolution,
  type Project,
  MeetingStatus,
  AgendaType,
  ResolutionStatus,
} from "../types";

// ─── Mock Projects ──────────────────────────────────────

export const mockProjects: Project[] = [
  {
    project_id: "PRJ-001",
    project_code: "DG-2567-001",
    name: "โครงการพัฒนาระบบบริการประชาชนออนไลน์ (e-Service)",
    agency: "สำนักยุทธศาสตร์และประเมินผล",
    budget: 45000000,
    description:
      "พัฒนาระบบบริการประชาชนผ่านช่องทางออนไลน์แบบครบวงจร เพื่อลดขั้นตอนการติดต่อราชการ สนับสนุนการให้บริการแบบ One Stop Service และเชื่อมต่อกับระบบฐานข้อมูลกลางของกรุงเทพมหานคร",
    objective:
      "เพิ่มประสิทธิภาพการให้บริการประชาชนผ่านช่องทางดิจิทัล ลดระยะเวลาการดำเนินงานไม่น้อยกว่า 50%",
    start_date: "2567-01-15",
    end_date: "2567-12-31",
    status: "อยู่ระหว่างดำเนินการ",
  },
  {
    project_id: "PRJ-002",
    project_code: "DG-2567-002",
    name: "โครงการ Smart City Dashboard สำหรับผู้บริหาร",
    agency: "สำนักการจราจรและขนส่ง",
    budget: 28500000,
    description:
      "พัฒนาระบบ Dashboard แสดงข้อมูลเมืองแบบ Real-time สำหรับผู้บริหารระดับสูง ครอบคลุมข้อมูลการจราจร สิ่งแวดล้อม ความปลอดภัย และบริการสาธารณะ",
    objective:
      "สนับสนุนการตัดสินใจเชิงนโยบายด้วยข้อมูลแบบ Real-time และ Data Visualization",
    start_date: "2567-03-01",
    end_date: "2568-02-28",
    status: "รอพิจารณา",
  },
  {
    project_id: "PRJ-003",
    project_code: "DG-2567-003",
    name: "โครงการปรับปรุงโครงสร้างพื้นฐานเครือข่ายคอมพิวเตอร์ (Network Modernization)",
    agency: "สำนักการคลัง",
    budget: 62000000,
    description:
      "ปรับปรุงระบบเครือข่ายคอมพิวเตอร์ของกรุงเทพมหานคร รวมถึงการติดตั้ง Firewall, การอัปเกรด Core Switch และการวางระบบ SD-WAN เพื่อเชื่อมต่อสำนักงานเขตทั้ง 50 เขต",
    objective:
      "เพิ่มความเร็วเครือข่าย 10 เท่า พร้อมยกระดับความปลอดภัยทางไซเบอร์ตามมาตรฐาน ISO 27001",
    start_date: "2567-04-01",
    end_date: "2568-03-31",
    status: "อยู่ระหว่างดำเนินการ",
  },
  {
    project_id: "PRJ-004",
    project_code: "DG-2567-004",
    name: "โครงการระบบจัดการข้อร้องเรียนอัจฉริยะ (AI Complaint Management)",
    agency: "สำนักงานปกครองและทะเบียน",
    budget: 15800000,
    description:
      "พัฒนาระบบจัดการข้อร้องเรียนที่ใช้ AI ในการจำแนกประเภท จัดลำดับความสำคัญ และส่งต่อหน่วยงานที่เกี่ยวข้องโดยอัตโนมัติ รองรับช่องทาง LINE, เว็บไซต์ และแอปพลิเคชัน",
    objective:
      "ลดระยะเวลาการตอบกลับข้อร้องเรียนจากเฉลี่ย 7 วัน เหลือไม่เกิน 24 ชั่วโมง",
    start_date: "2567-06-01",
    end_date: "2567-11-30",
    status: "รอพิจารณา",
  },
  {
    project_id: "PRJ-005",
    project_code: "DG-2567-005",
    name: "โครงการฝึกอบรมทักษะดิจิทัลสำหรับบุคลากร กทม. (Digital Literacy Program)",
    agency: "สำนักงานคณะกรรมการข้าราชการ กทม.",
    budget: 8200000,
    description:
      "จัดฝึกอบรมทักษะดิจิทัลให้กับข้าราชการและบุคลากรของกรุงเทพมหานคร ครอบคลุมหลักสูตร Data Analytics, Cybersecurity Awareness และ Digital Tools for Productivity",
    objective:
      "พัฒนาทักษะดิจิทัลให้บุคลากรไม่น้อยกว่า 5,000 คน ภายในปีงบประมาณ 2567",
    start_date: "2567-02-01",
    end_date: "2567-09-30",
    status: "อนุมัติแล้ว",
  },
];

// ─── Mock Resolutions ───────────────────────────────────

export const mockResolutions: Resolution[] = [
  // Resolutions for Meeting MTG-001 (Completed)
  {
    resolution_id: "RES-001",
    agenda_id: "AGD-001-01",
    resolution_status: null,
    comment: "ที่ประชุมรับทราบผลการดำเนินงานด้านดิจิทัลประจำปี 2566 ตามที่ฝ่ายเลขานุการเสนอ",
  },
  {
    resolution_id: "RES-002",
    agenda_id: "AGD-001-02",
    resolution_status: null,
    comment: "ที่ประชุมรับทราบรายงานความคืบหน้าโครงการ Smart City Phase 1",
  },
  {
    resolution_id: "RES-003",
    agenda_id: "AGD-001-03",
    resolution_status: null,
    comment: "ที่ประชุมรับรองรายงานการประชุมครั้งที่ 4/2566 โดยไม่มีการแก้ไข",
  },
  {
    resolution_id: "RES-004",
    agenda_id: "AGD-001-04",
    resolution_status: ResolutionStatus.APPROVED,
    comment:
      "ที่ประชุมมีมติเห็นชอบโครงการพัฒนาระบบ e-Service ตามที่เสนอ โดยมีเงื่อนไขให้เพิ่มมาตรการรักษาความปลอดภัยข้อมูลส่วนบุคคลตาม PDPA และให้รายงานความคืบหน้าทุกไตรมาส",
  },
  {
    resolution_id: "RES-005",
    agenda_id: "AGD-001-05",
    resolution_status: ResolutionStatus.RECONSIDER,
    comment:
      "ที่ประชุมมีมติให้ทบทวนงบประมาณโครงการ Smart City Dashboard ใหม่ โดยให้ลดงบประมาณลง 20% และปรับแผนการดำเนินงานให้สอดคล้องกับแผนแม่บท IT ของ กทม. แล้วนำเสนอใหม่ในการประชุมครั้งถัดไป",
  },
  {
    resolution_id: "RES-006",
    agenda_id: "AGD-001-06",
    resolution_status: null,
    comment: "ที่ประชุมรับทราบ กำหนดวันประชุมครั้งถัดไป วันที่ 15 มีนาคม 2567",
  },
  // Resolutions for Meeting MTG-003 (In Progress — partial)
  {
    resolution_id: "RES-007",
    agenda_id: "AGD-003-01",
    resolution_status: null,
    comment: "ที่ประชุมรับทราบความคืบหน้าการปรับปรุงเครือข่ายที่สำนักงานเขตนำร่อง 10 เขต",
  },
];

// ─── Mock Agendas ───────────────────────────────────────

export const mockAgendas: Agenda[] = [
  // Meeting MTG-001: Completed meeting with full agendas
  {
    agenda_id: "AGD-001-01",
    meeting_id: "MTG-001",
    project_id: null,
    agenda_number: 1,
    agenda_type: AgendaType.FOR_INFORMATION,
    title: "รายงานผลการดำเนินงานด้านดิจิทัลประจำปี 2566",
    description: "สรุปผลการดำเนินงานโครงการด้านดิจิทัลทั้งหมดในปีงบประมาณ 2566",
    project: null,
    resolution: mockResolutions[0],
  },
  {
    agenda_id: "AGD-001-02",
    meeting_id: "MTG-001",
    project_id: null,
    agenda_number: 2,
    agenda_type: AgendaType.FOR_INFORMATION,
    title: "ความคืบหน้าโครงการ Smart City Phase 1",
    description: "รายงานสถานะล่าสุดของโครงการ Smart City ระยะที่ 1",
    project: null,
    resolution: mockResolutions[1],
  },
  {
    agenda_id: "AGD-001-03",
    meeting_id: "MTG-001",
    project_id: null,
    agenda_number: 3,
    agenda_type: AgendaType.APPROVE_MINUTES,
    title: "รับรองรายงานการประชุมครั้งที่ 4/2566",
    description: "พิจารณารับรองรายงานการประชุมคณะกรรมการดิจิทัลครั้งที่ 4/2566 เมื่อวันที่ 20 พฤศจิกายน 2566",
    project: null,
    resolution: mockResolutions[2],
  },
  {
    agenda_id: "AGD-001-04",
    meeting_id: "MTG-001",
    project_id: "PRJ-001",
    agenda_number: 4,
    agenda_type: AgendaType.FOR_CONSIDERATION,
    title: "พิจารณาโครงการพัฒนาระบบบริการประชาชนออนไลน์ (e-Service)",
    description: "พิจารณาอนุมัติโครงการพัฒนาระบบ e-Service งบประมาณ 45 ล้านบาท",
    project: mockProjects[0],
    resolution: mockResolutions[3],
  },
  {
    agenda_id: "AGD-001-05",
    meeting_id: "MTG-001",
    project_id: "PRJ-002",
    agenda_number: 5,
    agenda_type: AgendaType.FOR_CONSIDERATION,
    title: "พิจารณาโครงการ Smart City Dashboard สำหรับผู้บริหาร",
    description: "พิจารณาอนุมัติโครงการ Smart City Dashboard งบประมาณ 28.5 ล้านบาท",
    project: mockProjects[1],
    resolution: mockResolutions[4],
  },
  {
    agenda_id: "AGD-001-06",
    meeting_id: "MTG-001",
    project_id: null,
    agenda_number: 6,
    agenda_type: AgendaType.OTHER,
    title: "กำหนดวันประชุมครั้งถัดไป",
    description: "พิจารณากำหนดวันและเวลาประชุมครั้งถัดไป",
    project: null,
    resolution: mockResolutions[5],
  },

  // Meeting MTG-002: Scheduled meeting with agendas
  {
    agenda_id: "AGD-002-01",
    meeting_id: "MTG-002",
    project_id: null,
    agenda_number: 1,
    agenda_type: AgendaType.FOR_INFORMATION,
    title: "รายงานสถานะโครงการที่อยู่ระหว่างดำเนินการ",
    description: "สรุปสถานะโครงการดิจิทัลที่อยู่ระหว่างดำเนินการทั้งหมด",
    project: null,
    resolution: null,
  },
  {
    agenda_id: "AGD-002-02",
    meeting_id: "MTG-002",
    project_id: null,
    agenda_number: 2,
    agenda_type: AgendaType.APPROVE_MINUTES,
    title: "รับรองรายงานการประชุมครั้งที่ 1/2567",
    description: "พิจารณารับรองรายงานการประชุมครั้งที่ 1/2567",
    project: null,
    resolution: null,
  },
  {
    agenda_id: "AGD-002-03",
    meeting_id: "MTG-002",
    project_id: "PRJ-003",
    agenda_number: 3,
    agenda_type: AgendaType.FOR_CONSIDERATION,
    title: "พิจารณาโครงการปรับปรุงโครงสร้างพื้นฐานเครือข่ายคอมพิวเตอร์",
    description: "พิจารณาอนุมัติโครงการ Network Modernization งบประมาณ 62 ล้านบาท",
    project: mockProjects[2],
    resolution: null,
  },
  {
    agenda_id: "AGD-002-04",
    meeting_id: "MTG-002",
    project_id: "PRJ-004",
    agenda_number: 4,
    agenda_type: AgendaType.FOR_CONSIDERATION,
    title: "พิจารณาโครงการระบบจัดการข้อร้องเรียนอัจฉริยะ (AI Complaint Management)",
    description: "พิจารณาอนุมัติโครงการ AI Complaint Management งบประมาณ 15.8 ล้านบาท",
    project: mockProjects[3],
    resolution: null,
  },
  {
    agenda_id: "AGD-002-05",
    meeting_id: "MTG-002",
    project_id: null,
    agenda_number: 5,
    agenda_type: AgendaType.OTHER,
    title: "แผนการจัดการความเสี่ยงด้านไซเบอร์ปี 2568",
    description: "หารือเกี่ยวกับแผนจัดการความเสี่ยงด้านไซเบอร์สำหรับปีงบประมาณ 2568",
    project: null,
    resolution: null,
  },

  // Meeting MTG-003: In Progress (some resolutions recorded)
  {
    agenda_id: "AGD-003-01",
    meeting_id: "MTG-003",
    project_id: null,
    agenda_number: 1,
    agenda_type: AgendaType.FOR_INFORMATION,
    title: "ความคืบหน้าการปรับปรุงเครือข่ายคอมพิวเตอร์สำนักงานเขต",
    description: "รายงานความคืบหน้าการติดตั้งระบบเครือข่ายใหม่ที่สำนักงานเขตนำร่อง 10 เขต",
    project: null,
    resolution: mockResolutions[6],
  },
  {
    agenda_id: "AGD-003-02",
    meeting_id: "MTG-003",
    project_id: null,
    agenda_number: 2,
    agenda_type: AgendaType.APPROVE_MINUTES,
    title: "รับรองรายงานการประชุมครั้งที่ 2/2567",
    description: "พิจารณารับรองรายงานการประชุมครั้งที่ 2/2567",
    project: null,
    resolution: null,
  },
  {
    agenda_id: "AGD-003-03",
    meeting_id: "MTG-003",
    project_id: "PRJ-005",
    agenda_number: 3,
    agenda_type: AgendaType.FOR_CONSIDERATION,
    title: "พิจารณาโครงการฝึกอบรมทักษะดิจิทัลสำหรับบุคลากร กทม.",
    description: "พิจารณาอนุมัติโครงการ Digital Literacy Program งบประมาณ 8.2 ล้านบาท",
    project: mockProjects[4],
    resolution: null,
  },
  {
    agenda_id: "AGD-003-04",
    meeting_id: "MTG-003",
    project_id: null,
    agenda_number: 4,
    agenda_type: AgendaType.OTHER,
    title: "การเตรียมความพร้อมรองรับ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)",
    description: "หารือแนวทางการปฏิบัติตาม PDPA ของหน่วยงานในสังกัด กทม.",
    project: null,
    resolution: null,
  },

  // Meeting MTG-004: Draft meeting (minimal agendas)
  {
    agenda_id: "AGD-004-01",
    meeting_id: "MTG-004",
    project_id: null,
    agenda_number: 1,
    agenda_type: AgendaType.FOR_INFORMATION,
    title: "สรุปผลการประเมินความพึงพอใจระบบ e-Service ไตรมาส 2",
    description: "รายงานผลสำรวจความพึงพอใจของประชาชนต่อระบบ e-Service",
    project: null,
    resolution: null,
  },
  {
    agenda_id: "AGD-004-02",
    meeting_id: "MTG-004",
    project_id: null,
    agenda_number: 2,
    agenda_type: AgendaType.APPROVE_MINUTES,
    title: "รับรองรายงานการประชุมครั้งที่ 3/2567",
    description: "พิจารณารับรองรายงานการประชุมครั้งที่ 3/2567",
    project: null,
    resolution: null,
  },
];

// ─── Mock Meetings ──────────────────────────────────────

export const mockMeetings: Meeting[] = [
  {
    meeting_id: "MTG-001",
    meeting_no: "1/2567",
    title: "การประชุมคณะกรรมการดิจิทัลเพื่อการพัฒนากรุงเทพมหานคร ครั้งที่ 1/2567",
    meeting_date: "2567-01-25",
    location: "ห้องประชุมชั้น 8 อาคารธานีนพรัตน์ ศาลาว่าการกรุงเทพมหานคร 2",
    chairman: "นายชัชชาติ สิทธิพันธุ์",
    meeting_status: MeetingStatus.COMPLETED,
    agendas: mockAgendas.filter((a) => a.meeting_id === "MTG-001"),
  },
  {
    meeting_id: "MTG-002",
    meeting_no: "2/2567",
    title: "การประชุมคณะกรรมการดิจิทัลเพื่อการพัฒนากรุงเทพมหานคร ครั้งที่ 2/2567",
    meeting_date: "2567-03-15",
    location: "ห้องประชุมชั้น 8 อาคารธานีนพรัตน์ ศาลาว่าการกรุงเทพมหานคร 2",
    chairman: "นายชัชชาติ สิทธิพันธุ์",
    meeting_status: MeetingStatus.SCHEDULED,
    agendas: mockAgendas.filter((a) => a.meeting_id === "MTG-002"),
  },
  {
    meeting_id: "MTG-003",
    meeting_no: "3/2567",
    title: "การประชุมคณะอนุกรรมการด้านโครงสร้างพื้นฐานดิจิทัล ครั้งที่ 3/2567",
    meeting_date: "2567-05-20",
    location: "ห้องรัตนโกสินทร์ ศาลาว่าการกรุงเทพมหานคร (เสาชิงช้า)",
    chairman: "นายวิศณุ ทรัพย์สมพล",
    meeting_status: MeetingStatus.IN_PROGRESS,
    agendas: mockAgendas.filter((a) => a.meeting_id === "MTG-003"),
  },
  {
    meeting_id: "MTG-004",
    meeting_no: "4/2567",
    title: "การประชุมคณะกรรมการดิจิทัลเพื่อการพัฒนากรุงเทพมหานคร ครั้งที่ 4/2567",
    meeting_date: "2567-07-10",
    location: "ห้องประชุมชั้น 8 อาคารธานีนพรัตน์",
    chairman: "นายชัชชาติ สิทธิพันธุ์",
    meeting_status: MeetingStatus.DRAFT,
    agendas: mockAgendas.filter((a) => a.meeting_id === "MTG-004"),
  },
  {
    meeting_id: "MTG-005",
    meeting_no: "พิเศษ 1/2567",
    title: "การประชุมวาระพิเศษ: กรณีเร่งด่วนระบบ Cybersecurity",
    meeting_date: "2567-04-05",
    location: "ห้องประชุม War Room ชั้น 3 อาคารสำนักการคลัง",
    chairman: "นายวิศณุ ทรัพย์สมพล",
    meeting_status: MeetingStatus.COMPLETED,
    agendas: [],
  },
  {
    meeting_id: "MTG-006",
    meeting_no: "5/2567",
    title: "การประชุมคณะกรรมการดิจิทัลเพื่อการพัฒนากรุงเทพมหานคร ครั้งที่ 5/2567",
    meeting_date: "2567-09-18",
    location: "ห้องประชุมชั้น 8 อาคารธานีนพรัตน์",
    chairman: "นายชัชชาติ สิทธิพันธุ์",
    meeting_status: MeetingStatus.CANCELLED,
    agendas: [],
  },
];
