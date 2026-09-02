// frontend/src/types/models.ts

// Enum เป็น Union Types (รับส่งผ่าน API เป็น String จะใช้ง่ายกว่า)
export type Role = 'SUPERADMIN' | 'ADMIN' | 'SECRETARY' | 'ANALYTIC' | 'USER';
export type ProjectStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

// แปลง Model เป็น Interface
export interface User {
  id: string;
  username: string;
  // ❌ ไม่ต้องใส่ password เพราะเราไม่เคยส่งรหัสผ่านกลับมาให้หน้าบ้านอยู่แล้ว
  role: Role;
  departmentName: string;
  projects?: Project[]; // ใส่ ? เผื่อกรณีที่ API ไม่ได้ join ข้อมูลนี้มาให้
}

export interface Budget {
  id: string;
  year: string;
  amount: number;
  budgetType: string;
  projectId: string;
  project?: Project;
}

export interface Project {
  id: string;
  projectName: string;
  agencyName: string;
  totalBudget: number;
  status: ProjectStatus;
  authorId: string;
  author?: User; 
  budgetsByYear?: Budget[]; 
  
  // ข้อควรระวัง: วันที่ที่รับส่งผ่าน API (JSON) จะกลายเป็น String เสมอ
  createdAt: string; 
  updatedAt: string;
}