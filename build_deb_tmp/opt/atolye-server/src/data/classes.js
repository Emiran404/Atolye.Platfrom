// Sınıf listesi
export const CLASS_LIST = [
  '9-A', '9-B', '9-C', '9-D', '9-E', '9-F',
  '10-A', '10-B', '10-C', '10-D', '10-E', '10-F',
  '11-A', '11-B', '11-C', '11-D', '11-E', '11-F',
  '12-A', '12-B', '12-C', '12-D', '12-E', '12-F'
];

export const classes = CLASS_LIST.map((name, index) => ({
  id: `class-${index + 1}`,
  name,
  grade: parseInt(name.split('-')[0]),
  section: name.split('-')[1],
  studentCount: Math.floor(Math.random() * 10) + 20, // 20-30 öğrenci
  createdAt: new Date('2024-09-01').toISOString()
}));
