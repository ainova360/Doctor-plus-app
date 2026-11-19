import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import {
  AccessibilityIcon,
  ActivityLogIcon,
  AvatarIcon,
  BellIcon,
  BookmarkIcon,
  CalendarIcon,
  ChatBubbleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  ClockIcon,
  Cross2Icon,
  EyeOpenIcon,
  FileTextIcon,
  HeartFilledIcon,
  HeartIcon,
  HomeIcon,
  ImageIcon,
  IdCardIcon,
  MagnifyingGlassIcon,
  MobileIcon,
  MixerHorizontalIcon,
  PaperPlaneIcon,
  PersonIcon,
  PlusIcon,
  SpeakerModerateIcon,
  StarFilledIcon,
  TimerIcon,
  VideoIcon,
} from "@radix-ui/react-icons";
import { KeyboardInput, MobileScroll, useKeyboard, useKeyboardInsets } from "./mobile";

type Lang = "ar" | "en";
type Role = "patient" | "doctor" | "admin";
type Tab = "home" | "appointments" | "health" | "favorites" | "profile";
type Screen = Tab | "doctors" | "booking" | "service" | "auth" | "chat" | "credentials" | "workspaceSettings" | "support" | "reports" | "family" | "insurance" | "patientSettings" | "notifications" | "healthRecord" | "wellness";
type Consultation = "clinic" | "voice" | "video";
type ChatMessage = { id: number; from: "doctor" | "patient"; text: string; time: string };
type HealthRecordSection = "prescriptions" | "results" | "records" | "allergies";
type HealthRecordEntry = { id: string; title: string; detail: string; date: string; status: string };
type FamilyMember = { id: string; name: string; relation: "spouse" | "child" | "parent" | "other"; birthDate: string };
type InsuranceData = { provider: string; memberId: string; policyNumber: string; coverage: string; expiresAt: string };
type PatientSettingsData = { appointmentReminders: boolean; medicationReminders: boolean; biometricLogin: boolean; shareWithDoctor: boolean };
type NotificationPreferences = { appointmentUpdates: boolean; doctorMessages: boolean; labResults: boolean; medicationReminders: boolean };

const copy = {
  ar: {
    lang: "EN", brand: "دكتور بلس", hello: "أهلاً، سارة", subtitle: "كيف نقدر نساعدك اليوم؟", search: "ابحث عن طبيب، تخصص، أو خدمة", upcoming: "موعدك القادم", viewAll: "عرض الكل", upcomingDoctor: "د. ليلى الحسن", specialty: "طب القلب", tomorrow: "غداً، 10:30 صباحاً", details: "تفاصيل الموعد", quick: "خدمات سريعة", all: "عرض الجميع", book: "احجز موعداً", online: "استشارة أونلاين", pharmacy: "صيدلية", lab: "تحاليل مخبرية", emergency: "مساعدة عاجلة", specialties: "التخصصات", doctors: "أطباء موصى بهم", seeAll: "عرض الكل", reviews: "تقييم", home: "الرئيسية", appointments: "مواعيدي", health: "صحتي", favorites: "المفضلة", profile: "حسابي", chooseSpecialty: "اختر التخصص", chooseDoctor: "اختر الطبيب", selectDate: "اختر التاريخ", selectTime: "اختر الوقت", confirm: "تأكيد الحجز", bookingTitle: "احجز موعدك", bookingSub: "اختر ما يناسبك من الأطباء والمواعيد المتاحة.", available: "متاح اليوم", next: "متابعة", booked: "تم تأكيد موعدك", bookedSub: "أرسلنا تفاصيل الموعد إلى إشعاراتك.", done: "تم", noAppointments: "لا توجد مواعيد أخرى حالياً", appointmentHistory: "سجل المواعيد", upcomingLabel: "القادمة", past: "السابقة", healthTitle: "ملفي الصحي", healthSub: "كل معلوماتك الصحية في مكان واحد.", prescriptions: "الوصفات الطبية", results: "نتائج التحاليل", records: "السجلات الطبية", allergies: "الحساسية", bloodType: "فصيلة الدم", bloodPressure: "ضغط الدم", profileTitle: "حسابي", editProfile: "تعديل الملف الشخصي", family: "أفراد العائلة", insurance: "التأمين الصحي", settings: "الإعدادات", help: "المساعدة والدعم", signOut: "تسجيل الخروج", servicesTitle: "كل الخدمات", serviceHint: "اختر الخدمة التي تحتاجها", cancel: "إلغاء", favorite: "المفضلة", onlineNow: "متاح للاستشارة", years: "سنة خبرة", patients: "مريض", date1: "اليوم، 19 نوفمبر", date2: "غداً، 20 نوفمبر", date3: "السبت، 21 نوفمبر", morning: "صباحاً", evening: "مساءً", noTimes: "اختر وقتاً متاحاً", continue: "متابعة الحجز", myDoctors: "أطبائي", wellness: "نصائح صحية", reminder: "تذكير الدواء", prescriptionCount: "وصفة نشطة", labCount: "نتيجة جديدة", upcomingCount: "موعد قادم", selectService: "اختر الخدمة", consultation: "كشف في العيادة", video: "استشارة فيديو", homeVisit: "زيارة منزلية", serviceSelected: "اختر طريقة الاستشارة", choose: "اختيار", confirmed: "تم الحجز بنجاح", confirmMessage: "موعدك مع", slot: "الاثنين، 24 نوفمبر · 11:00 صباحاً", specialtyCount: "تخصص طبي", showMore: "اكتشف المزيد", featured: "رعاية تناسبك", featuredSub: "أطباء موثوقون ورعاية صحية قريبة منك.", upcomingShort: "موعدك القادم", notification: "الإشعارات", profileName: "سارة أحمد", edit: "تعديل", doctorTitle: "الأطباء", filters: "التصفية", sort: "الأعلى تقييماً", searchDoctors: "ابحث عن طبيب أو تخصص", noResults: "لا توجد نتائج مطابقة", today: "اليوم", appointmentLocation: "مركز الشفاء الطبي · عمّان", consultType: "كشف في العيادة", covered: "مشمول بالتأمين", familyTitle: "عائلتي", addFamily: "إضافة فرد", save: "حفظ التغييرات", saved: "تم حفظ التغييرات", profileInfo: "المعلومات الشخصية", phone: "رقم الهاتف", email: "البريد الإلكتروني", dob: "تاريخ الميلاد", notificationsTitle: "تذكير بموعدك", notificationsText: "لديك موعد مع د. ليلى غداً الساعة 10:30 صباحاً.", accountSafety: "خصوصيتك وبياناتك الصحية بأمان.", healthCard: "البطاقة الصحية", meds: "أدويتي", allDoctors: "كل الأطباء", loadMore: "تحميل المزيد", reviewCount: "128 مراجعة", insured: "يقبل التأمين", favoritesTitle: "أطبائي المفضلون", noFavorites: "لم تضف أطباء إلى المفضلة بعد", addFavoriteHint: "احفظ طبيباً للعودة إلى ملفه وحجز موعد معه بسرعة.", removeFavorite: "إزالة من المفضلة", fullName: "الاسم الكامل", editHealth: "تعديل بياناتي الصحية", discoverDoctors: "اكتشف الأطباء", specialtiesShort: ["قلب", "أسنان", "أطفال", "عيون", "جلدية", "عظام", "نساء", "أعصاب"], services: ["حجز طبيب", "استشارة أونلاين", "صيدلية", "تحاليل مخبرية", "رعاية منزلية", "طوارئ", "تأمين صحي", "تطعيمات", "علاج طبيعي", "تغذية", "صحة نفسية", "رعاية الأم والطفل"], healthCards: ["الوصفات الطبية", "نتائج التحاليل", "السجلات الطبية", "الحساسية"],
  },
  en: {
    lang: "عربي", brand: "Doctor Plus", hello: "Hello, Sarah", subtitle: "How can we help you today?", search: "Search doctors, specialties, or services", upcoming: "Your next appointment", viewAll: "View all", upcomingDoctor: "Dr. Layla Al Hassan", specialty: "Cardiology", tomorrow: "Tomorrow, 10:30 AM", details: "Appointment details", quick: "Quick services", all: "View all", book: "Book an appointment", online: "Online consult", pharmacy: "Pharmacy", lab: "Lab tests", emergency: "Urgent care", specialties: "Specialties", doctors: "Recommended doctors", seeAll: "See all", reviews: "reviews", home: "Home", appointments: "Bookings", health: "My health", favorites: "Favorites", profile: "Profile", chooseSpecialty: "Choose a specialty", chooseDoctor: "Choose a doctor", selectDate: "Choose a date", selectTime: "Choose a time", confirm: "Confirm booking", bookingTitle: "Book an appointment", bookingSub: "Choose a doctor and a time that works for you.", available: "Available today", next: "Continue", booked: "Appointment confirmed", bookedSub: "Your appointment details are in notifications.", done: "Done", noAppointments: "No other appointments right now", appointmentHistory: "Appointment history", upcomingLabel: "Upcoming", past: "Past", healthTitle: "My health record", healthSub: "Your health information, all in one place.", prescriptions: "Prescriptions", results: "Lab results", records: "Medical records", allergies: "Allergies", bloodType: "Blood type", bloodPressure: "Blood pressure", profileTitle: "My profile", editProfile: "Edit profile", family: "Family members", insurance: "Health insurance", settings: "Settings", help: "Help & support", signOut: "Sign out", servicesTitle: "All services", serviceHint: "Choose what you need", cancel: "Cancel", favorite: "Favorite", onlineNow: "Available online", years: "years exp.", patients: "patients", date1: "Today, Nov 19", date2: "Tomorrow, Nov 20", date3: "Sat, Nov 21", morning: "Morning", evening: "Afternoon", noTimes: "Select an available time", continue: "Continue booking", myDoctors: "My doctors", wellness: "Health tips", reminder: "Medication reminder", prescriptionCount: "active prescription", labCount: "new result", upcomingCount: "upcoming", selectService: "Select a service", consultation: "In-clinic visit", video: "Video consultation", homeVisit: "Home visit", serviceSelected: "Choose consultation type", choose: "Select", confirmed: "Booking successful", confirmMessage: "Appointment with", slot: "Mon, Nov 24 · 11:00 AM", specialtyCount: "medical specialties", showMore: "Explore more", featured: "Care made for you", featuredSub: "Trusted doctors and care, close to home.", upcomingShort: "Next appointment", notification: "Notifications", profileName: "Sarah Ahmed", edit: "Edit", doctorTitle: "Doctors", filters: "Filters", sort: "Top rated", searchDoctors: "Search a doctor or specialty", noResults: "No matching results", today: "Today", appointmentLocation: "Al Shifa Medical Center · Amman", consultType: "In-clinic visit", covered: "Insurance accepted", familyTitle: "My family", addFamily: "Add member", save: "Save changes", saved: "Changes saved", profileInfo: "Personal information", phone: "Phone number", email: "Email address", dob: "Date of birth", notificationsTitle: "Appointment reminder", notificationsText: "You have an appointment with Dr. Layla tomorrow at 10:30 AM.", accountSafety: "Your privacy and health data are protected.", healthCard: "Health card", meds: "My medications", allDoctors: "All doctors", loadMore: "Load more", reviewCount: "128 reviews", insured: "Insurance accepted", favoritesTitle: "My favorite doctors", noFavorites: "You haven't saved any doctors yet", addFavoriteHint: "Save a doctor to revisit their profile and book faster.", removeFavorite: "Remove favorite", fullName: "Full name", editHealth: "Edit health details", discoverDoctors: "Explore doctors", specialtiesShort: ["Heart", "Dental", "Kids", "Eyes", "Skin", "Bones", "Women", "Neuro"], services: ["Find a doctor", "Online consult", "Pharmacy", "Lab tests", "Home care", "Urgent care", "Insurance", "Vaccines", "Physiotherapy", "Nutrition", "Mental health", "Mother & child"], healthCards: ["Prescriptions", "Lab results", "Medical records", "Allergies"],
  },
} as const;

const roleCopy = {
  ar: { patientRole: "المريض", doctorRole: "الطبيب", adminRole: "الإدارة", doctorHomeTitle: "مساحة الطبيب", adminHomeTitle: "لوحة الإدارة", todaySchedule: "جدول اليوم", nextPatient: "المريض التالي", myPatients: "مرضاي", careTeam: "فريق الرعاية", doctorWelcome: "أهلاً د. ليلى", adminWelcome: "مرحباً بك في لوحة الإدارة", activePatients: "مريض مسجل", activeDoctors: "طبيب نشط", todayBookings: "موعد اليوم", monthlyRevenue: "إيرادات الشهر", manageDoctors: "إدارة الأطباء", managePatients: "إدارة المرضى", manageBookings: "إدارة المواعيد", manageServices: "الخدمات والتخصصات", reports: "التقارير والتحليلات", pending: "بانتظار التأكيد", confirmedStatus: "مؤكد", accept: "تأكيد الموعد", reschedule: "إعادة الجدولة", statusUpdated: "تم تحديث حالة الموعد", roleLabel: "مساحة العمل", switchRole: "تبديل المستخدم", roleNames: ["المريض", "الطبيب", "الإدارة"] },
  en: { patientRole: "Patient", doctorRole: "Doctor", adminRole: "Admin", doctorHomeTitle: "Doctor workspace", adminHomeTitle: "Admin dashboard", todaySchedule: "Today's schedule", nextPatient: "Next patient", myPatients: "My patients", careTeam: "Care team", doctorWelcome: "Welcome, Dr. Layla", adminWelcome: "Welcome to your admin workspace", activePatients: "Registered patients", activeDoctors: "Active doctors", todayBookings: "Today's bookings", monthlyRevenue: "Monthly revenue", manageDoctors: "Manage doctors", managePatients: "Manage patients", manageBookings: "Manage appointments", manageServices: "Services & specialties", reports: "Reports & analytics", pending: "Awaiting confirmation", confirmedStatus: "Confirmed", accept: "Confirm visit", reschedule: "Reschedule", statusUpdated: "Appointment status updated", roleLabel: "Workspace", switchRole: "Switch role", roleNames: ["Patient", "Doctor", "Admin"] },
} as const;

const communicationCopy = {
  ar: {
    messageDoctor: "راسل الطبيب", chatTitle: "محادثة الطبيب", chatOnline: "متاح للرد في النموذج", chatPrivacy: "نموذج تجريبي — لا تُرسل الرسائل فعلياً", messagePlaceholder: "اكتب رسالتك للطبيب...", sendMessage: "إرسال الرسالة", clinicMode: "زيارة في العيادة", clinicDescription: "موعد حضوري مع الطبيب", voiceMode: "مكالمة صوتية", voiceDescription: "تواصل صوتي خاص", videoMode: "مكالمة فيديو", videoDescription: "استشارة مباشرة بالصوت والصورة", consultationMode: "طريقة الموعد", callTypeLabel: "نوع الموعد", chatDoctorHello: "مرحباً سارة، كيف أستطيع مساعدتك؟", chatPatientQuestion: "أشعر بصداع منذ أمس.", chatDoctorFollowup: "هل يصاحبه دوار أو ارتفاع في الحرارة؟", callBooking: "حجز مكالمة", messageSent: "تم إرسال رسالتك"
  },
  en: {
    messageDoctor: "Message doctor", chatTitle: "Doctor chat", chatOnline: "Demo doctor available", chatPrivacy: "Demo only — messages are not sent", messagePlaceholder: "Write a message to your doctor...", sendMessage: "Send message", clinicMode: "In-clinic visit", clinicDescription: "Meet your doctor in person", voiceMode: "Voice call", voiceDescription: "A private audio consultation", videoMode: "Video call", videoDescription: "A live face-to-face consultation", consultationMode: "Appointment type", callTypeLabel: "Appointment type", chatDoctorHello: "Hi Sarah, how can I help you today?", chatPatientQuestion: "I've had a headache since yesterday.", chatDoctorFollowup: "Do you also have dizziness or a fever?", callBooking: "Book a call", messageSent: "Message sent"
  }
} as const;

const doctors = [
  { name: "Dr. Layla Al Hassan", nameAr: "د. ليلى الحسن", title: { ar: "أخصائية قلب وأوعية دموية", en: "Cardiology specialist" }, rating: "4.9", reviews: 128, initials: "LH", photo: "/assets/doctors/layla.jpg", tone: "rose", specialty: "Cardiology" },
  { name: "Dr. Omar Nasser", nameAr: "د. عمر ناصر", title: { ar: "استشاري طب الأطفال", en: "Pediatric consultant" }, rating: "4.8", reviews: 96, initials: "ON", photo: "/assets/doctors/omar.jpg", tone: "mint", specialty: "Pediatrics" },
  { name: "Dr. Maya Saleh", nameAr: "د. مايا صالح", title: { ar: "أخصائية طب وجراحة الأسنان", en: "Dental specialist" }, rating: "4.9", reviews: 84, initials: "MS", photo: "/assets/doctors/maya.jpg", tone: "lavender", specialty: "Dentistry" },
];

const specialties = ["Cardiology", "Dentistry", "Pediatrics", "Ophthalmology", "Dermatology", "Orthopedics", "Gynecology", "Neurology"];
const serviceIcons = [PersonIcon, VideoIcon, PlusIcon, ActivityLogIcon, HomeIcon, Cross2Icon, CheckIcon, CheckIcon, AccessibilityIcon, StarFilledIcon, HeartFilledIcon, AvatarIcon];
const additionalServices = {
  ar: ["زياراتي الصحية", "تشخيصاتي", "الصور الطبية", "التقارير الطبية", "الوصفات الطبية", "تذكير الأدوية", "مؤشراتي الصحية", "جدول التطعيمات", "الحساسية", "ملاحظات الطوارئ", "مستنداتي الطبية", "مشاركة السجل الصحي", "سجل الوصول", "التبرع بالأعضاء", "التبرع بالدم", "التبرع بنخاع العظم", "الأجهزة المرتبطة", "المساعد الصحي", "تقييم الزيارة", "الوصفات البصرية", "ملفات العائلة الصحية"],
  en: ["Health visits", "Diagnoses", "Medical imaging", "Medical reports", "Prescriptions", "Medication reminders", "Health measurements", "Vaccination schedule", "Allergies", "Emergency notes", "Medical documents", "Share health record", "Access history", "Organ donation", "Blood donation", "Bone marrow donation", "Connected devices", "Health assistant", "Visit feedback", "Optical prescriptions", "Family health profiles"],
} as const;
const additionalServiceIcons = [CalendarIcon, ActivityLogIcon, ImageIcon, FileTextIcon, ClipboardIcon, BellIcon, ActivityLogIcon, CheckIcon, HeartIcon, BellIcon, FileTextIcon, PersonIcon, IdCardIcon, HeartFilledIcon, HeartIcon, HeartFilledIcon, MobileIcon, AvatarIcon, StarFilledIcon, EyeOpenIcon, PersonIcon];
const specialtyIcons = [HeartFilledIcon, Cross2Icon, PersonIcon, EyeOpenIcon, HeartIcon, AccessibilityIcon, PersonIcon, ActivityLogIcon];
const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];

export default function Prototype() {
  const [lang, setLang] = useState<Lang>("ar");
  const [role, setRole] = useState<Role>("patient");
  const [roleOpen, setRoleOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [screen, setScreen] = useState<Screen>("auth");
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0].name);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedTime, setSelectedTime] = useState("10:30");
  const [consultation, setConsultation] = useState<Consultation>("clinic");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [chatDoctorName, setChatDoctorName] = useState(doctors[0].name);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const chatThreadRef = useRef<HTMLDivElement | null>(null);
  const navigationRef = useRef<HTMLElement | null>(null);
  const [service, setService] = useState("");
  const [serviceChoice, setServiceChoice] = useState("");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("all");
  const [favoriteDoctors, setFavoriteDoctors] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("doctor-plus-favorites") || "[]") as string[]; } catch { return []; }
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingHealth, setEditingHealth] = useState(false);
  const [selectedHealthSection, setSelectedHealthSection] = useState<HealthRecordSection>("prescriptions");
  const [healthRecords, setHealthRecords] = useState<Record<HealthRecordSection, HealthRecordEntry[]>>(() => ({
    prescriptions: readLocal("doctor-plus-health-records:prescriptions", [{ id: "rx-vitamin-d", title: "Vitamin D3", detail: "1 capsule · once daily · Dr. Layla", date: "2026-11-12", status: "Active" }]),
    results: readLocal("doctor-plus-health-records:results", [{ id: "lab-cbc", title: "Complete blood count", detail: "Within normal range · Hemoglobin 13.4 g/dL", date: "2026-11-15", status: "Ready" }]),
    records: readLocal("doctor-plus-health-records:records", [{ id: "visit-cardio", title: "Cardiology check-up", detail: "Dr. Layla Al Hassan · Al Shifa Medical Center", date: "2026-10-28", status: "Visit" }]),
    allergies: readLocal("doctor-plus-health-records:allergies", []),
  }));
  const [wellnessChecks, setWellnessChecks] = useState<boolean[]>(() => readLocal("doctor-plus-wellness-checks", [false, false, false]));
  const [profileData, setProfileData] = useState(() => readLocal("doctor-plus-profile", { name: "", email: "sarah.ahmed@email.com", phone: "+962 7 9000 0000", dob: "1994-05-12" }));
  const [profileDraft, setProfileDraft] = useState(profileData);
  const [profilePhotos, setProfilePhotos] = useState<Record<string, string>>(() => readLocal("doctor-plus-profile-photos", { patient: "", doctor: "" }));
  const [healthData, setHealthData] = useState(() => readLocal("doctor-plus-health", { bloodType: "O+", bloodPressure: "118/78", bloodSugar: "95", pulse: "72", weight: "68", allergies: "" }));
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => readLocal("doctor-plus-family-members", [
    { id: "family-demo-1", name: "Mariam Ahmed", relation: "child" as const, birthDate: "2014-06-12" },
    { id: "family-demo-2", name: "Omar Ahmed", relation: "spouse" as const, birthDate: "1991-04-20" },
  ]));
  const [insuranceData, setInsuranceData] = useState<InsuranceData>(() => readLocal("doctor-plus-insurance", { provider: "Anatolia Health", memberId: "DP-2048-115", policyNumber: "POL-7843-22", coverage: "individual" as const, expiresAt: "2027-03-31" }));
  const [patientSettings, setPatientSettings] = useState<PatientSettingsData>(() => readLocal("doctor-plus-patient-settings", { appointmentReminders: true, medicationReminders: true, biometricLogin: false, shareWithDoctor: true }));
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => readLocal("doctor-plus-notification-preferences", { appointmentUpdates: true, doctorMessages: true, labResults: true, medicationReminders: true }));
  const keyboard = useKeyboard();
  const { bottomInset: keyboardBottomInset } = useKeyboardInsets();
  const t = { ...copy[lang], ...communicationCopy[lang], ...roleCopy[lang] };
  const allServices = [...t.services, ...additionalServices[lang]];
  const allServiceIcons = [...serviceIcons, ...additionalServiceIcons];
  const rtl = lang === "ar";
  useEffect(() => {
    const scroll = document.querySelector<HTMLElement>(".app-scroll .mobile-scroll");
    if (scroll) scroll.scrollTop = 0;
    keyboard.hide();
  }, [screen, role]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang, rtl]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("doctor-plus-favorites", JSON.stringify(favoriteDoctors)); }, [favoriteDoctors]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("doctor-plus-profile", JSON.stringify(profileData)); }, [profileData]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("doctor-plus-health", JSON.stringify(healthData)); }, [healthData]);
  useEffect(() => { if (typeof window !== "undefined") Object.entries(healthRecords).forEach(([section, entries]) => window.localStorage.setItem(`doctor-plus-health-records:${section}`, JSON.stringify(entries))); }, [healthRecords]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("doctor-plus-wellness-checks", JSON.stringify(wellnessChecks)); }, [wellnessChecks]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("doctor-plus-family-members", JSON.stringify(familyMembers)); }, [familyMembers]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("doctor-plus-insurance", JSON.stringify(insuranceData)); }, [insuranceData]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("doctor-plus-patient-settings", JSON.stringify(patientSettings)); }, [patientSettings]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("doctor-plus-notification-preferences", JSON.stringify(notificationPreferences)); }, [notificationPreferences]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("doctor-plus-profile-photos", JSON.stringify(profilePhotos)); }, [profilePhotos]);
  useLayoutEffect(() => {
    const nav = navigationRef.current;
    if (!nav) return;
    const moveBubble = () => {
      const active = nav.querySelector<HTMLButtonElement>(`[data-nav-item="${tab}"]`);
      if (!active) return;
      const x = active.offsetLeft + active.offsetWidth / 2 - 26;
      nav.style.setProperty("--nav-bubble-x", `${x}px`);
      nav.dataset.positioned = "true";
    };
    moveBubble();
    const observer = new ResizeObserver(moveBubble);
    observer.observe(nav);
    window.addEventListener("resize", moveBubble);
    return () => { observer.disconnect(); window.removeEventListener("resize", moveBubble); };
  }, [tab, role, lang, screen]);
  useEffect(() => {
    if (screen === "chat" && chatThreadRef.current) chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
  }, [screen, chatMessages]);
  const navLabels: Record<Tab, string> = role === "doctor"
    ? { home: t.home, appointments: lang === "ar" ? "جدولي" : "Schedule", health: t.myPatients, favorites: t.favorites, profile: t.profile }
    : role === "admin"
      ? { home: t.home, appointments: lang === "ar" ? "المواعيد" : "Bookings", health: t.managePatients, favorites: t.favorites, profile: t.profile }
    : { home: t.home, appointments: t.appointments, health: t.health, favorites: t.favorites, profile: t.profile };
  const navigationItems: Tab[] = role === "patient"
    ? ["appointments", "health", "home", "favorites", "profile"]
    : ["home", "appointments", "health", "profile"];
  const toggleFavorite = (doctorName: string) => setFavoriteDoctors((current) => current.includes(doctorName) ? current.filter((name) => name !== doctorName) : [...current, doctorName]);

  const go = (next: Screen) => {
    keyboard.hide();
    setScreen(next);
    if (["home", "appointments", "health", "favorites", "profile"].includes(next)) setTab(next as Tab);
  };

  const filteredDoctors = useMemo(() => doctors.filter((doctor) => {
    const needle = search.trim().toLowerCase();
    const matches = !needle || `${doctor.name} ${doctor.nameAr} ${doctor.specialty} ${doctor.title[lang]}`.toLowerCase().includes(needle);
    return matches && (filter !== "insured" || doctor.name !== "Dr. Omar Nasser");
  }), [search, filter, lang]);
  const availableBookingDoctors = selectedSpecialty ? doctors.filter((doctor) => doctor.specialty === selectedSpecialty) : doctors.slice(0, 2);

  const startBooking = (doctorName?: string, specialty?: string, appointmentType: Consultation = "clinic") => {
    keyboard.hide();
    if (doctorName) setSelectedDoctor(doctorName);
    if (specialty) setSelectedSpecialty(specialty);
    setConsultation(appointmentType);
    setScreen("booking");
  };

  const goHome = () => { setSearch(""); go("home"); };
  const startConversation = (doctor: (typeof doctors)[number]) => {
    setChatDoctorName(doctor.name);
    setChatMessages([
      { id: 1, from: "doctor", text: t.chatDoctorHello, time: "10:18" },
      { id: 2, from: "patient", text: t.chatPatientQuestion, time: "10:21" },
      { id: 3, from: "doctor", text: t.chatDoctorFollowup, time: "10:23" },
    ]);
    setChatDraft("");
    go("chat");
  };
  const sendChatMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = chatDraft.trim();
    if (!message) return;
    setChatMessages((current) => [...current, { id: Date.now(), from: "patient", text: message, time: lang === "ar" ? "الآن" : "Now" }]);
    setChatDraft("");
    keyboard.hide();
  };

  return (
    <div className={`doctor-app ${screen === "auth" ? "auth-mode" : ""}`} dir={rtl ? "rtl" : "ltr"} lang={lang}>
      <MobileScroll className="app-scroll">
        <main className="app-content">
          <header className="topbar">
            {screen !== "auth" && <button className="brand-mark" onClick={goHome} aria-label={t.brand}>
              <span className="brand-icon"><img src="/assets/doctor-plus-mark.svg" alt="" /></span>
              <span className="brand-name">{t.brand}</span>
            </button>}
            <div className="top-actions">
              <button className="role-switch" onClick={() => { keyboard.hide(); setRoleOpen(true); }} aria-label={t.switchRole}><PersonIcon width="14" height="14" /><span>{role === "patient" ? t.patientRole : role === "doctor" ? t.doctorRole : t.adminRole}</span></button>
              <button className="language-switch" onClick={() => setLang(rtl ? "en" : "ar")} aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}>{t.lang}</button>
              <button className="icon-button notification-button" aria-label={t.notification} onClick={() => setNoticeOpen(true)}><BellIcon width="19" height="19" /><i /></button>
            </div>
          </header>

          {screen === "home" && role === "patient" && <section className="screen home-screen">
            <div className="greeting"><div><p className="eyebrow">{t.hello}</p><h1>{t.subtitle}</h1></div><div className="profile-avatar small-avatar">SA</div></div>
            <button className="search-box" onClick={() => go("doctors")}><MagnifyingGlassIcon width="18" height="18" /><span>{t.search}</span><span className="search-shortcut">⌘ K</span></button>
            <section className="feature-card">
              <div className="feature-copy"><span className="feature-tag">{t.featured}</span><h2>{t.featuredSub}</h2><button className="feature-cta" onClick={() => go("doctors")}>{t.showMore}<ChevronRightIcon className="arrow-icon" width="15" height="15" /></button></div>
              <div className="feature-visual"><div className="doctor-portrait portrait-layla"><img src="/assets/doctors/layla.jpg" alt="" /></div><div className="feature-badge"><StarFilledIcon width="12" height="12" /> 4.9</div><div className="feature-plus"><PlusIcon width="13" height="13" /></div></div>
            </section>
            <div className="section-heading"><div><h2>{t.upcoming}</h2><p>{t.tomorrow}</p></div><button className="text-button" onClick={() => go("appointments")}>{t.viewAll}</button></div>
            <button className="appointment-card" onClick={() => go("appointments")}>
              <DoctorAvatar doctor={doctors[0]} /><div className="appointment-info"><strong>{t.upcomingDoctor}</strong><span>{t.specialty}</span><span className="appointment-location"><ClockIcon width="13" height="13" /> {t.tomorrow}</span></div><ChevronRightIcon className="arrow-icon" width="18" height="18" />
            </button>
            <div className="section-heading"><h2>{t.quick}</h2><button className="text-button" onClick={() => go("service")}>{t.all}</button></div>
            <div className="quick-grid">
              {t.services.slice(0, 4).map((label, i) => { const Icon = serviceIcons[i]; return <button className="quick-item" key={label} onClick={() => { if (i === 0) return go("doctors"); if (i === 1) return startBooking(undefined, undefined, "video"); setService(label); setServiceChoice(""); setSaved(false); setNoticeOpen(true); }}><span className={`quick-icon tint-${i}`}><Icon width="19" height="19" /></span><span>{label}</span></button>; })}
            </div>
            <div className="section-heading"><h2>{t.specialties}</h2><button className="text-button" onClick={() => go("service")}>{t.all}</button></div>
            <div className="specialty-grid">
              {t.specialtiesShort.map((label, i) => { const Icon = specialtyIcons[i]; return <button className="specialty-item" key={label} onClick={() => { setSelectedSpecialty(specialties[i]); go("doctors"); }}><span className={`specialty-icon specialty-${i}`}><Icon width="20" height="20" /></span><span>{label}</span></button>; })}
            </div>
            <div className="section-heading"><h2>{t.doctors}</h2><button className="text-button" onClick={() => go("doctors")}>{t.seeAll}</button></div>
            <div className="doctor-list">{doctors.slice(0, 2).map((doctor) => <DoctorCard key={doctor.name} doctor={doctor} lang={lang} t={t} isFavorite={favoriteDoctors.includes(doctor.name)} onFavorite={() => toggleFavorite(doctor.name)} onBook={() => startBooking(doctor.name, doctor.specialty)} onMessage={() => startConversation(doctor)} onOpen={() => { setSelectedDoctor(doctor.name); go("doctors"); }} />)}</div>
            <div className="home-footnote"><HeartIcon width="15" height="15" /> {t.accountSafety}</div>
          </section>}

          {screen === "home" && role === "doctor" && <DoctorDashboard lang={lang} t={t} onAppointments={() => go("appointments")} onPatients={() => go("health")} onNotify={() => setNoticeOpen(true)} />}
          {screen === "home" && role === "admin" && <AdminDashboard lang={lang} t={t} onOpen={(target) => target === "manageBookings" ? go("appointments") : target === "managePatients" ? go("health") : setNoticeOpen(true)} />}

          {screen === "doctors" && <section className="screen sub-screen">
            <ScreenTitle title={t.doctorTitle} onBack={goHome} rtl={rtl} />
            <div className="search-box doctor-search"><MagnifyingGlassIcon width="18" height="18" /><KeyboardInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchDoctors} /><button aria-label={t.cancel} onClick={() => setSearch("")}><Cross2Icon width="15" height="15" /></button></div>
            <div className="filter-row"><button className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>{t.sort}</button><button className={`filter-chip ${filter === "insured" ? "active" : ""}`} onClick={() => setFilter(filter === "insured" ? "all" : "insured")}>{t.insured}</button><button className="filter-chip" onClick={() => setSelectedSpecialty("")}>{selectedSpecialty || t.specialties}</button></div>
            <div className="results-caption">{t.allDoctors} <span>{filteredDoctors.length}</span></div>
            {filteredDoctors.length ? <div className="doctor-list full-doctor-list">{filteredDoctors.map((doctor) => <DoctorCard key={doctor.name} doctor={doctor} lang={lang} t={t} isFavorite={favoriteDoctors.includes(doctor.name)} onFavorite={() => toggleFavorite(doctor.name)} onBook={() => startBooking(doctor.name, doctor.specialty)} onMessage={() => startConversation(doctor)} onOpen={() => { setSelectedDoctor(doctor.name); startConversation(doctor); }} />)}</div> : <div className="empty-state"><MagnifyingGlassIcon width="25" height="25" /><strong>{t.noResults}</strong></div>}
          </section>}

          {screen === "booking" && <section className="screen sub-screen booking-screen">
            <ScreenTitle title={t.bookingTitle} onBack={goHome} rtl={rtl} /><p className="screen-intro">{t.bookingSub}</p>
            <h2 className="step-heading">1 <span>{t.chooseSpecialty}</span></h2>
            <div className="booking-specialties">{specialties.slice(0, 6).map((item) => <button key={item} className={`booking-specialty ${selectedSpecialty === item ? "selected" : ""}`} onClick={() => { setSelectedSpecialty(item); const matchingDoctor = doctors.find((doctor) => doctor.specialty === item); if (matchingDoctor) setSelectedDoctor(matchingDoctor.name); }}>{specialtyLabel(item, lang)}</button>)}</div>
            <h2 className="step-heading">2 <span>{t.chooseDoctor}</span></h2>
            <div className="booking-doctor-list">{availableBookingDoctors.slice(0, 2).map((doctor) => <button key={doctor.name} className={`booking-doctor ${selectedDoctor === doctor.name ? "selected" : ""}`} onClick={() => setSelectedDoctor(doctor.name)}><DoctorAvatar doctor={doctor} /><span><strong>{doctorDisplayName(doctor, lang)}</strong><small>{doctor.title[lang]}</small></span><i className="selection-dot" /></button>)}{selectedSpecialty && !availableBookingDoctors.length && <div className="booking-empty"><Cross2Icon width="17" height="17" />{t.noResults}</div>}</div>
            <h2 className="step-heading">3 <span>{t.selectDate}</span></h2>
            <div className="date-row">{[t.date1, t.date2, t.date3].map((date, i) => <button key={date} className={`date-option ${selectedDate === i ? "selected" : ""}`} onClick={() => setSelectedDate(i)}><small>{i === 0 ? t.today : i === 1 ? (lang === "ar" ? "غداً" : "Tomorrow") : (lang === "ar" ? "السبت" : "Saturday")}</small><strong>{19 + i}</strong><small>{lang === "ar" ? "نوفمبر" : "Nov"}</small></button>)}</div>
            <h2 className="step-heading">4 <span>{t.selectTime}</span></h2>
            <div className="time-grid">{timeSlots.map((slot, i) => <button key={slot} className={`time-option ${selectedTime === slot ? "selected" : ""} ${i === 2 ? "unavailable" : ""}`} disabled={i === 2} onClick={() => setSelectedTime(slot)}>{slot}</button>)}</div>
            <h2 className="step-heading">5 <span>{t.consultationMode}</span></h2>
            <div className="consultation-grid">{(["clinic", "voice", "video"] as Consultation[]).map((mode) => { const Icon = mode === "clinic" ? CalendarIcon : mode === "voice" ? SpeakerModerateIcon : VideoIcon; const title = mode === "clinic" ? t.clinicMode : mode === "voice" ? t.voiceMode : t.videoMode; const detail = mode === "clinic" ? t.clinicDescription : mode === "voice" ? t.voiceDescription : t.videoDescription; return <button key={mode} className={`consultation-card ${consultation === mode ? "selected" : ""}`} aria-pressed={consultation === mode} onClick={() => setConsultation(mode)}><span className={`consultation-icon mode-${mode}`}><Icon width="19" height="19" /></span><strong>{title}</strong><small>{detail}</small></button>; })}</div>
            <div className="booking-summary"><DoctorAvatar doctor={doctors.find((d) => d.name === selectedDoctor) || doctors[0]} /><div><strong>{doctorDisplayName(doctors.find((d) => d.name === selectedDoctor) || doctors[0], lang)}</strong><span>{specialtyLabel(selectedSpecialty || "Cardiology", lang)}</span><small className="consultation-summary">{consultation === "clinic" ? t.clinicMode : consultation === "voice" ? t.voiceMode : t.videoMode}</small></div><strong className="price">$25</strong></div>
            <button className="primary-button full-button" disabled={Boolean(selectedSpecialty && !availableBookingDoctors.length)} onClick={() => { setBookingConfirmed(true); setNoticeOpen(true); }}>{t.confirm}<ChevronRightIcon className="arrow-icon" width="17" height="17" /></button>
          </section>}

          {screen === "service" && <section className="screen sub-screen"><ScreenTitle title={t.servicesTitle} onBack={goHome} rtl={rtl} /><p className="screen-intro">{t.serviceHint}</p><div className="all-services-grid">{allServices.map((label, i) => { const Icon = allServiceIcons[i]; return <button className="service-card" key={label} onClick={() => { if (i === 0) return go("doctors"); if (i === 1) return startBooking(undefined, undefined, "video"); setService(label); setServiceChoice(""); setSaved(false); setNoticeOpen(true); }}><span className={`service-icon tint-${i % 4}`}><Icon width="20" height="20" /></span><strong>{label}</strong><ChevronRightIcon className="arrow-icon" width="16" height="16" /></button>; })}</div></section>}

          {screen === "appointments" && role === "patient" && <section className="screen sub-screen"><ScreenTitle title={t.appointments} onBack={goHome} rtl={rtl} /><div className="appointment-tabs"><button className={filter !== "past" ? "active" : ""} onClick={() => setFilter("all")}>{t.upcomingLabel}</button><button className={filter === "past" ? "active" : ""} onClick={() => setFilter("past")}>{t.past}</button></div>{filter === "past" ? <div className="empty-state"><CalendarIcon width="25" height="25" /><strong>{t.noAppointments}</strong></div> : <><div className="appointment-date-label"><CalendarIcon width="15" height="15" /> {t.date2}</div><div className="appointment-detail-card"><div className="doctor-row"><DoctorAvatar doctor={doctors[0]} /><div><strong>{t.upcomingDoctor}</strong><span>{t.specialty}</span></div><button className="more-button" onClick={() => setNoticeOpen(true)}>···</button></div><div className="detail-separator" /><div className="detail-line"><ClockIcon width="16" height="16" /><span>{t.tomorrow}</span></div><div className="detail-line">{consultation === "clinic" ? <CalendarIcon width="16" height="16" /> : consultation === "voice" ? <SpeakerModerateIcon width="16" height="16" /> : <VideoIcon width="16" height="16" />}<span>{t.callTypeLabel}: {consultation === "clinic" ? t.clinicMode : consultation === "voice" ? t.voiceMode : t.videoMode}</span></div>{consultation === "clinic" && <div className="detail-line"><HomeIcon width="16" height="16" /><span>{t.appointmentLocation}</span></div>}<div className="detail-line"><CheckIcon width="16" height="16" /><span>{t.covered}</span></div><div className="appointment-contact-actions"><button className="message-doctor-action" onClick={() => startConversation(doctors[0])}><ChatBubbleIcon width="16" height="16" />{t.messageDoctor}</button><button className="secondary-button" onClick={() => startBooking(doctors[0].name, doctors[0].specialty, consultation)}><CalendarIcon width="15" height="15" />{t.details}</button></div></div><button className="add-appointment" onClick={() => startBooking()}><PlusIcon width="17" height="17" /> {t.book}</button></>}</section>}

          {screen === "appointments" && role === "doctor" && <DoctorSchedule lang={lang} t={t} onNotify={() => setNoticeOpen(true)} onBack={goHome} />}
          {screen === "appointments" && role === "admin" && <AdminBookings lang={lang} t={t} onNotify={() => setNoticeOpen(true)} onBack={goHome} />}

          {screen === "health" && role === "patient" && <section className="screen sub-screen health-page-screen">
            <ScreenTitle title={t.healthTitle} onBack={goHome} rtl={rtl} />
            <p className="screen-intro">{t.healthSub}</p>
            <div className="health-hero-banner"><div><span>{lang === "ar" ? "رعايتك الصحية" : "YOUR HEALTHCARE"}</span><strong>{lang === "ar" ? "سجلك الصحي، مرتب وواضح" : "Your health record, clear and organized"}</strong><small>{lang === "ar" ? "تابع معلوماتك الطبية من مكان واحد." : "Keep your medical information in one place."}</small></div><img src="/assets/health-records-illustration.svg" alt="" aria-hidden="true" /></div>
            <div className="health-overview">
              <div className="health-card-head"><span className="health-pulse"><HeartIcon width="18" height="18" /></span><span><strong>{t.healthCard}</strong><small>{profileData.name || t.profileName}</small></span><span className="verified"><CheckIcon width="13" height="13" /></span></div>
              {editingHealth ? <div className="health-editor">
                <label>{t.bloodType}<input value={healthData.bloodType} onChange={(e) => setHealthData({ ...healthData, bloodType: e.target.value })} /></label>
                <label>{t.bloodPressure}<input value={healthData.bloodPressure} onChange={(e) => setHealthData({ ...healthData, bloodPressure: e.target.value })} /></label>
                <label>{lang === "ar" ? "سكر الدم" : "Blood sugar"}<input value={healthData.bloodSugar} onChange={(e) => setHealthData({ ...healthData, bloodSugar: e.target.value })} /></label>
                <label>{lang === "ar" ? "النبض" : "Pulse"}<input value={healthData.pulse} onChange={(e) => setHealthData({ ...healthData, pulse: e.target.value })} /></label>
                <label>{lang === "ar" ? "الوزن (كغ)" : "Weight (kg)"}<input value={healthData.weight} onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })} /></label>
                <label>{t.allergies}<input value={healthData.allergies || (lang === "ar" ? "لا يوجد" : "None")} onChange={(e) => setHealthData({ ...healthData, allergies: e.target.value })} /></label>
                <button className="primary-button full-button" onClick={() => setEditingHealth(false)}>{t.save}</button>
              </div> : <>
                <div className="health-metrics"><div><small>{t.bloodPressure}</small><strong>{healthData.bloodPressure}</strong></div><div><small>{lang === "ar" ? "سكر الدم" : "Blood sugar"}</small><strong>{healthData.bloodSugar} <i>mg/dL</i></strong></div><div><small>{lang === "ar" ? "النبض" : "Pulse"}</small><strong>{healthData.pulse} <i>{lang === "ar" ? "نبضة/د" : "bpm"}</i></strong></div></div>
                <div className="health-inline-meta"><span>{lang === "ar" ? "الوزن" : "Weight"}<strong>{healthData.weight} {lang === "ar" ? "كغ" : "kg"}</strong></span><span>{t.bloodType}<strong>{healthData.bloodType}</strong></span><span>{t.allergies}<strong>{healthData.allergies || (lang === "ar" ? "لا يوجد" : "None")}</strong></span></div>
                <button className="health-edit-button" onClick={() => setEditingHealth(true)}><PlusIcon width="14" height="14" />{t.editHealth}</button>
              </>}
            </div>
            <div className="section-heading health-heading"><h2>{t.records}</h2><button className="text-button" onClick={() => go("service")}>{t.seeAll}</button></div>
            <div className="health-list">{t.healthCards.map((label, i) => { const section = (["prescriptions", "results", "records", "allergies"] as HealthRecordSection[])[i]; const count = healthRecords[section].length; return <button className="health-list-item" key={label} onClick={() => { setSelectedHealthSection(section); go("healthRecord"); }}><span className={`health-item-icon tint-${i}`}><HealthIconByIndex index={i} /></span><span><strong>{label}</strong><small>{section === "prescriptions" ? `${count} ${lang === "ar" ? "وصفات نشطة" : "active prescriptions"}` : section === "results" ? `${count} ${lang === "ar" ? "نتائج متاحة" : "available results"}` : section === "allergies" && count === 0 ? (lang === "ar" ? "لم تتم إضافة حساسية" : "No allergies added") : `${count} ${lang === "ar" ? "ملفات محفوظة" : "saved records"}`}</small></span><ChevronRightIcon className="arrow-icon" width="17" height="17" /></button>; })}</div>
            <button className="wellness-card" onClick={() => go("wellness")}><span><StarFilledIcon width="13" height="13" /></span><div><strong>{t.wellness}</strong><p>{lang === "ar" ? "متابعة بسيطة اليوم تساعدك على صحة أفضل غداً." : "Small check-ins today help you feel better tomorrow."}</p></div><ChevronRightIcon className="arrow-icon" width="16" height="16" /></button>
          </section>}
          {screen === "healthRecord" && role === "patient" && <HealthRecordsScreen lang={lang} section={selectedHealthSection} entries={healthRecords[selectedHealthSection]} onBack={() => go("health")} onChange={(entries) => { setHealthRecords((current) => ({ ...current, [selectedHealthSection]: entries })); if (selectedHealthSection === "allergies") setHealthData((current) => ({ ...current, allergies: entries.map((entry) => entry.title).join(", ") })); }} />}
          {screen === "wellness" && role === "patient" && <WellnessScreen lang={lang} checks={wellnessChecks} onBack={() => go("health")} onToggle={(index) => setWellnessChecks((current) => current.map((checked, item) => item === index ? !checked : checked))} onEditHealth={() => { go("health"); setEditingHealth(true); }} />}
          {screen === "health" && role === "doctor" && <PeopleList title={t.myPatients} lang={lang} t={t} onOpen={() => setNoticeOpen(true)} onBack={goHome} />}
          {screen === "health" && role === "admin" && <PeopleList title={t.managePatients} lang={lang} t={t} onOpen={() => setNoticeOpen(true)} onBack={goHome} />}

          {screen === "favorites" && role === "patient" && <section className="screen sub-screen"><ScreenTitle title={t.favoritesTitle} onBack={goHome} rtl={rtl} /><p className="screen-intro">{t.addFavoriteHint}</p>{favoriteDoctors.length ? <div className="doctor-list full-doctor-list">{doctors.filter((doctor) => favoriteDoctors.includes(doctor.name)).map((doctor) => <DoctorCard key={doctor.name} doctor={doctor} lang={lang} t={t} isFavorite onFavorite={() => toggleFavorite(doctor.name)} onBook={() => startBooking(doctor.name, doctor.specialty)} onMessage={() => startConversation(doctor)} onOpen={() => { setSelectedDoctor(doctor.name); startConversation(doctor); }} />)}</div> : <div className="favorites-empty"><span><HeartFilledIcon width="25" height="25" /></span><strong>{t.noFavorites}</strong><p>{t.addFavoriteHint}</p><button className="primary-button" onClick={() => go("doctors")}>{t.discoverDoctors}</button></div>}</section>}
          {screen === "profile" && role === "patient" && <section className="screen sub-screen"><ScreenTitle title={t.profileTitle} onBack={goHome} rtl={rtl} />
            <div className="profile-card"><ProfilePhotoField lang={lang} photo={profilePhotos.patient} initials={(profileData.name || t.profileName).split(" ").map((part) => part[0]).join("").slice(0, 2)} label={lang === "ar" ? "تغيير الصورة الشخصية" : "Change profile photo"} onChange={(photo) => setProfilePhotos((current) => ({ ...current, patient: photo }))} /><div><strong>{profileData.name || t.profileName}</strong><small>{profileData.email}</small></div><button className="edit-button" onClick={() => { if (editingProfile) { setProfileDraft(profileData); setEditingProfile(false); } else { setProfileDraft(profileData); setEditingProfile(true); } }}>{editingProfile ? t.cancel : t.edit}</button></div>
            {editingProfile && <form className="profile-editor" onSubmit={(e) => { e.preventDefault(); setProfileData(profileDraft); setEditingProfile(false); }}><label>{t.fullName}<input value={profileDraft.name || t.profileName} onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })} required /></label><label>{t.email}<input type="email" value={profileDraft.email} onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })} required /></label><label>{t.phone}<input type="tel" value={profileDraft.phone} onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })} required /></label><label>{t.dob}<input type="date" value={profileDraft.dob} onChange={(e) => setProfileDraft({ ...profileDraft, dob: e.target.value })} required /></label><button className="primary-button full-button" type="submit">{t.save}</button></form>}
            <p className="menu-label">{t.profileInfo}</p><div className="profile-menu">{[[HeartIcon, t.family, "family"], [CheckIcon, t.insurance, "insurance"], [CalendarIcon, t.settings, "patientSettings"], [BellIcon, t.notification, "notifications"], [ChatBubbleIcon, t.help, "support"]].map(([Icon, label, target]: any) => <button className="profile-menu-item" key={target} onClick={() => go(target)}><span className="profile-menu-icon"><Icon width="18" height="18" /></span><span>{label}</span><ChevronRightIcon className="arrow-icon" width="17" height="17" /></button>)}</div>
            <div className="profile-safe"><HeartIcon width="15" height="15" /> {t.accountSafety}</div><button className="signout-button" onClick={() => go("auth")}>{t.signOut}</button></section>}
          {screen === "profile" && role !== "patient" && <WorkspaceProfile role={role} lang={lang} t={t} photo={profilePhotos.doctor || ""} onPhotoChange={(photo) => setProfilePhotos((current) => ({ ...current, doctor: photo }))} onNotify={() => setNoticeOpen(true)} onBack={goHome} onAction={(action) => {
            if (action === "appointments") go("appointments");
            else if (action === "patients") go("health");
            else if (action === "credentials") go("credentials");
            else if (action === "settings") go("workspaceSettings");
            else if (action === "help") go("support");
            else if (action === "doctors") go("doctors");
            else if (action === "services") go("service");
            else if (action === "reports") go("reports");
            else setNoticeOpen(true);
          }} />}
          {screen === "family" && role === "patient" && <FamilyMembersScreen lang={lang} members={familyMembers} setMembers={setFamilyMembers} onBack={() => go("profile")} />}
          {screen === "insurance" && role === "patient" && <InsuranceScreen lang={lang} data={insuranceData} setData={setInsuranceData} onBack={() => go("profile")} />}
          {screen === "patientSettings" && role === "patient" && <PatientSettingsScreen lang={lang} setLang={setLang} settings={patientSettings} setSettings={setPatientSettings} onBack={() => go("profile")} />}
          {screen === "notifications" && role === "patient" && <NotificationPreferencesScreen lang={lang} preferences={notificationPreferences} setPreferences={setNotificationPreferences} onBack={() => go("profile")} />}
          {screen === "credentials" && role === "doctor" && <DoctorCredentials lang={lang} onBack={() => go("profile")} />}
          {screen === "workspaceSettings" && <WorkspaceSettings lang={lang} role={role} onBack={() => go("profile")} />}
          {screen === "support" && <SupportCenter lang={lang} role={role} onBack={() => go("profile")} />}
          {screen === "reports" && role === "admin" && <AdminReports lang={lang} onBack={() => go("profile")} />}
          {screen === "auth" && <AuthScreen lang={lang} t={t} role={role} setRole={setRole} onDone={goHome} />}
        </main>
      </MobileScroll>

      {screen !== "auth" && screen !== "chat" && <nav ref={navigationRef} className={`bottom-navigation ${role === "patient" ? "patient-navigation" : ""}`} aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
        <span className="nav-active-bubble" aria-hidden="true" />
        {navigationItems.map((item) => { const Icon = item === "home" ? HomeIcon : item === "appointments" ? CalendarIcon : item === "health" ? (role === "patient" ? ActivityLogIcon : PersonIcon) : item === "favorites" ? HeartFilledIcon : PersonIcon; return <button key={item} data-nav-item={item} className={tab === item ? "active" : ""} aria-current={tab === item ? "page" : undefined} onClick={() => go(item)}><span className="nav-icon">{item === "health" && role === "patient" ? <HealthPulseIcon /> : <Icon width="18" height="18" />}</span><span className="nav-label">{navLabels[item]}</span></button>; })}
      </nav>}

      {roleOpen && <div className="modal-backdrop role-backdrop" onClick={() => setRoleOpen(false)}><section className="notice-sheet role-sheet" role="dialog" aria-modal="true" aria-label={t.switchRole} onClick={(e) => e.stopPropagation()}><div className="sheet-grabber" /><h2>{t.switchRole}</h2><p>{t.roleLabel}</p><div className="role-list">{(["patient", "doctor", "admin"] as Role[]).map((item, i) => { const Icon = item === "patient" ? PersonIcon : item === "doctor" ? HeartIcon : HomeIcon; return <button key={item} className={`role-option ${role === item ? "selected" : ""}`} onClick={() => { setRole(item); setRoleOpen(false); go("home"); }}><span className="role-option-icon"><Icon width="18" height="18" /></span><strong>{t.roleNames[i]}</strong>{role === item && <CheckIcon className="role-check" width="16" height="16" />}</button>; })}</div><button className="secondary-button" onClick={() => setRoleOpen(false)}>{t.cancel}</button></section></div>}

      {screen === "chat" && <section className="chat-screen" style={{ "--chat-keyboard-inset": `${keyboardBottomInset}px` } as CSSProperties}>
        <header className="chat-screen-header"><button className="chat-back" data-back-direction={rtl ? "rtl" : "ltr"} aria-label={rtl ? "رجوع" : "Back"} onClick={() => go("doctors")}>{rtl ? <ChevronRightIcon width="19" height="19" /> : <ChevronLeftIcon width="19" height="19" />}</button><strong>{t.chatTitle}</strong><button className="chat-call-button" aria-label={t.videoMode} onClick={() => startBooking(chatDoctorName, doctors.find((doctor) => doctor.name === chatDoctorName)?.specialty, "video")}><VideoIcon width="18" height="18" /></button></header>
        <div className="chat-doctor-card"><DoctorAvatar doctor={doctors.find((doctor) => doctor.name === chatDoctorName) || doctors[0]} /><div><strong>{doctorDisplayName(doctors.find((doctor) => doctor.name === chatDoctorName) || doctors[0], lang)}</strong><span>{t.chatOnline}</span></div><span className="chat-online-dot" /></div>
        <p className="chat-privacy"><CheckIcon width="13" height="13" />{t.chatPrivacy}</p>
        <div className="chat-thread" ref={chatThreadRef}>{chatMessages.map((message) => <div key={message.id} className={`chat-message ${message.from}`}><div className="chat-bubble"><p>{message.text}</p><time>{message.time}</time></div></div>)}</div>
        <form className="chat-composer" onSubmit={sendChatMessage}><KeyboardInput className="chat-input" value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder={t.messagePlaceholder} aria-label={t.messagePlaceholder} /><button className="send-message-button" type="submit" disabled={!chatDraft.trim()} aria-label={t.sendMessage}><PaperPlaneIcon width="18" height="18" /></button></form>
      </section>}

      {noticeOpen && <div className="modal-backdrop" role="presentation" onClick={() => setNoticeOpen(false)}><section className="notice-sheet" role="dialog" aria-modal="true" aria-label={service || t.notification} onClick={(e) => e.stopPropagation()}><div className="sheet-grabber" /><button className="sheet-close" onClick={() => setNoticeOpen(false)} aria-label={t.cancel}><Cross2Icon width="18" height="18" /></button><div className="success-icon"><CheckIcon width="24" height="24" /></div><h2>{bookingConfirmed ? t.confirmed : saved ? t.saved : service ? t.serviceSelected : t.notificationsTitle}</h2><p>{bookingConfirmed ? `${t.confirmMessage} ${doctorDisplayName(doctors.find((d) => d.name === selectedDoctor) || doctors[0], lang)} · ${selectedDate === 0 ? t.date1 : selectedDate === 1 ? t.date2 : t.date3} · ${selectedTime} · ${consultation === "clinic" ? t.clinicMode : consultation === "voice" ? t.voiceMode : t.videoMode}` : service ? (serviceChoice ? `${serviceChoice} · ${service}` : `${service} · ${t.serviceHint}`) : t.notificationsText}</p>{service && !saved && <div className="service-choice-list">{getServiceOptions(service, lang, t, allServices).map((item) => <button className="service-choice" key={item} onClick={() => { setServiceChoice(item); setSaved(true); }}><span>{item}</span><ChevronRightIcon className="arrow-icon" width="16" height="16" /></button>)}</div>}<button className="primary-button full-button" onClick={() => { if (service && !saved) return setSaved(true); setNoticeOpen(false); setService(""); setServiceChoice(""); setSaved(false); if (bookingConfirmed) { setBookingConfirmed(false); go("appointments"); } }}>{service ? (saved ? t.done : t.choose) : t.done}</button></section></div>}
    </div>
  );
}

function DoctorDashboard({ lang, t, onAppointments, onPatients, onNotify }: { lang: Lang; t: any; onAppointments: () => void; onPatients: () => void; onNotify: () => void }) {
  return <section className="screen role-dashboard"><div className="role-greeting"><span className="role-avatar doctor-role-avatar">LH</span><div><small>{t.doctorHomeTitle}</small><h1>{t.doctorWelcome}</h1></div><span className="live-dot" /></div><div className="role-stat-grid"><div className="role-stat primary-stat"><small>{t.todayBookings}</small><strong>8</strong><span>{lang === "ar" ? "+2 عن أمس" : "+2 from yesterday"}</span></div><div className="role-stat"><small>{t.myPatients}</small><strong>146</strong><span>{lang === "ar" ? "هذا الشهر" : "this month"}</span></div></div><div className="section-heading"><h2>{t.todaySchedule}</h2><button className="text-button" onClick={onAppointments}>{t.seeAll}</button></div><div className="schedule-card"><div className="schedule-time"><strong>09:30</strong><small>AM</small></div><div className="schedule-divider active" /><div className="schedule-details"><strong>{lang === "ar" ? "محمد العلي" : "Mohammad Ali"}</strong><span>{t.nextPatient} · {lang === "ar" ? "متابعة قلب" : "Cardiology follow-up"}</span><small><ClockIcon width="12" height="12" /> 30 {lang === "ar" ? "دقيقة" : "min"}</small></div><button className="schedule-more" onClick={onNotify}>···</button></div><div className="schedule-card"><div className="schedule-time"><strong>10:30</strong><small>AM</small></div><div className="schedule-divider" /><div className="schedule-details"><strong>{lang === "ar" ? "نور خليل" : "Noor Khalil"}</strong><span>{lang === "ar" ? "استشارة جديدة" : "New consultation"}</span><small><ClockIcon width="12" height="12" /> 20 {lang === "ar" ? "دقيقة" : "min"}</small></div><button className="schedule-more" onClick={onNotify}>···</button></div><div className="section-heading"><h2>{t.careTeam}</h2><button className="text-button" onClick={onPatients}>{t.seeAll}</button></div><div className="role-shortcuts"><button onClick={onPatients}><PersonIcon width="18" height="18" /><span>{t.myPatients}</span><ChevronRightIcon width="15" height="15" /></button><button onClick={onNotify}><CalendarIcon width="18" height="18" /><span>{lang === "ar" ? "تعديل أوقات الدوام" : "Manage availability"}</span><ChevronRightIcon width="15" height="15" /></button></div><div className="week-chart"><div className="week-chart-heading"><div><strong>{lang === "ar" ? "ملخص المواعيد" : "Appointment overview"}</strong><small>{lang === "ar" ? "هذا الأسبوع" : "This week"}</small></div><span>{lang === "ar" ? "32 موعداً" : "32 bookings"}</span></div><div className="bars">{[42, 63, 54, 88, 69, 45, 30].map((height, i) => <div key={i}><i style={{ height: `${height}%` }} /><small>{(lang === "ar" ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : ["M", "T", "W", "T", "F", "S", "S"])[i]}</small></div>)}</div></div></section>;
}

function AdminReports({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const ar = lang === "ar";
  return <section className="screen sub-screen"><ScreenTitle title={ar ? "التقارير والتحليلات" : "Reports & analytics"} onBack={onBack} rtl={ar} /><p className="screen-intro">{ar ? "مؤشرات تجريبية لمتابعة أداء المنصة." : "Demo metrics for monitoring platform activity."}</p><div className="admin-stat-grid"><div className="admin-stat"><span className="admin-stat-icon tint-0"><PersonIcon width="17" height="17" /></span><small>{ar ? "مستخدمون جدد" : "New users"}</small><strong>+184</strong><em>+12.8%</em></div><div className="admin-stat"><span className="admin-stat-icon tint-1"><CalendarIcon width="17" height="17" /></span><small>{ar ? "حجوزات مكتملة" : "Completed bookings"}</small><strong>1,248</strong><em>+8.2%</em></div><div className="admin-stat"><span className="admin-stat-icon tint-2"><HeartIcon width="17" height="17" /></span><small>{ar ? "معدل رضا المرضى" : "Patient satisfaction"}</small><strong>4.8/5</strong><em>+0.3</em></div><div className="admin-stat"><span className="admin-stat-icon tint-3"><CheckIcon width="17" height="17" /></span><small>{ar ? "نسبة حضور المواعيد" : "Appointment attendance"}</small><strong>92%</strong><em>+3.1%</em></div></div><div className="week-chart"><div className="week-chart-heading"><div><strong>{ar ? "نشاط الحجوزات" : "Booking activity"}</strong><small>{ar ? "آخر 7 أيام" : "Last 7 days"}</small></div><span>{ar ? "324 هذا الأسبوع" : "324 this week"}</span></div><div className="bars">{[42,63,54,88,69,45,75].map((height,i)=><div key={i}><i style={{height:`${height}%`}}/><small>{(ar?["ح","ن","ث","ر","خ","ج","س"]:["M","T","W","T","F","S","S"])[i]}</small></div>)}</div></div><p className="profile-safe"><CheckIcon width="15" height="15" />{ar ? "هذه البيانات للعرض التجريبي فقط." : "These figures are demo data only."}</p></section>;
}

function AdminDashboard({ lang, t, onOpen }: { lang: Lang; t: any; onOpen: (target: string) => void }) {
  const actions = [t.manageDoctors, t.managePatients, t.manageBookings, t.manageServices, t.reports];
  const icons = [HeartIcon, PersonIcon, CalendarIcon, PlusIcon, StarFilledIcon];
  const targets = ["manageDoctors", "managePatients", "manageBookings", "manageServices", "reports"];
  return <section className="screen role-dashboard admin-dashboard"><div className="admin-hero"><div><small>{t.adminHomeTitle}</small><h1>{t.adminWelcome}</h1><p>{lang === "ar" ? "نظرة سريعة على أداء المنصة اليوم." : "A quick look at today's platform activity."}</p></div><span className="admin-avatar"><HomeIcon width="19" height="19" /></span></div><div className="admin-stat-grid"><div className="admin-stat"><span className="admin-stat-icon tint-0"><PersonIcon width="17" height="17" /></span><small>{t.activePatients}</small><strong>2,480</strong><em>+12.8%</em></div><div className="admin-stat"><span className="admin-stat-icon tint-1"><HeartIcon width="17" height="17" /></span><small>{t.activeDoctors}</small><strong>186</strong><em>+8.2%</em></div><div className="admin-stat"><span className="admin-stat-icon tint-2"><CalendarIcon width="17" height="17" /></span><small>{t.todayBookings}</small><strong>324</strong><em>+5.4%</em></div><div className="admin-stat"><span className="admin-stat-icon tint-3"><CheckIcon width="17" height="17" /></span><small>{t.monthlyRevenue}</small><strong>$18.6k</strong><em>+9.1%</em></div></div><div className="section-heading"><h2>{lang === "ar" ? "إدارة المنصة" : "Platform management"}</h2></div><div className="admin-actions">{actions.map((label, i) => { const Icon = icons[i]; return <button key={label} onClick={() => onOpen(targets[i])}><span className={`admin-action-icon tint-${i % 4}`}><Icon width="18" height="18" /></span><strong>{label}</strong><ChevronRightIcon className="arrow-icon" width="16" height="16" /></button>; })}</div><div className="admin-activity"><div className="section-heading"><h2>{lang === "ar" ? "آخر النشاطات" : "Recent activity"}</h2><button className="text-button" onClick={() => onOpen("reports")}>{t.seeAll}</button></div><div className="activity-row"><span className="activity-dot green" /><span><strong>{lang === "ar" ? "تم تأكيد موعد جديد" : "New appointment confirmed"}</strong><small>{lang === "ar" ? "منذ 4 دقائق · د. ليلى الحسن" : "4 min ago · Dr. Layla Al Hassan"}</small></span></div><div className="activity-row"><span className="activity-dot blue" /><span><strong>{lang === "ar" ? "انضم طبيب جديد للمنصة" : "A new doctor joined"}</strong><small>{lang === "ar" ? "منذ 18 دقيقة · د. عمر ناصر" : "18 min ago · Dr. Omar Nasser"}</small></span></div></div></section>;
}

function DoctorSchedule({ lang, t, onNotify, onBack }: { lang: Lang; t: any; onNotify: () => void; onBack: () => void }) {
  const [accepted, setAccepted] = useState(false);
  return <section className="screen sub-screen"><ScreenTitle title={t.todaySchedule} onBack={onBack} rtl={lang === "ar"} /><div className="schedule-date-banner"><CalendarIcon width="17" height="17" /><span>{lang === "ar" ? "الأربعاء، 19 نوفمبر" : "Wednesday, November 19"}</span><button onClick={onNotify}>{lang === "ar" ? "تعديل" : "Edit"}</button></div><div className="schedule-summary"><div><strong>8</strong><small>{t.todayBookings}</small></div><div><strong>5</strong><small>{t.confirmedStatus}</small></div><div><strong>3</strong><small>{t.pending}</small></div></div>{["Mohammad Ali", "Noor Khalil", "James Parker", "Sara Mansour"].map((name, i) => <article className="schedule-list-card" key={name}><div className={`patient-avatar patient-${i}`}>{name.split(" ").map((x) => x[0]).join("")}</div><div className="schedule-list-info"><strong>{lang === "ar" ? ["محمد العلي", "نور خليل", "جيمس باركر", "سارة منصور"][i] : name}</strong><span>{lang === "ar" ? ["متابعة قلبية", "استشارة أولى", "مراجعة نتائج", "متابعة دورية"][i] : ["Cardiology follow-up", "First consultation", "Results review", "Routine follow-up"][i]}</span><small><ClockIcon width="12" height="12" /> {`${9 + i}:30 ${lang === "ar" ? "ص" : "AM"}`} · 30 {lang === "ar" ? "دقيقة" : "min"}</small></div><span className={`status-pill ${i === 1 && !accepted ? "pending" : "confirmed"}`}>{i === 1 && !accepted ? t.pending : t.confirmedStatus}</span></article>)}<button className="primary-button full-button schedule-primary" onClick={() => { setAccepted(true); onNotify(); }}>{accepted ? t.statusUpdated : t.accept}</button></section>;
}

function AdminBookings({ lang, t, onNotify, onBack }: { lang: Lang; t: any; onNotify: () => void; onBack: () => void }) {
  return <section className="screen sub-screen"><ScreenTitle title={t.manageBookings} onBack={onBack} rtl={lang === "ar"} /><div className="admin-booking-metrics"><span><strong>324</strong><small>{t.todayBookings}</small></span><span><strong>18</strong><small>{t.pending}</small></span></div><div className="filter-row"><button className="filter-chip active">{t.upcomingLabel}</button><button className="filter-chip">{t.pending}</button><button className="filter-chip">{lang === "ar" ? "مكتمل" : "Completed"}</button></div>{["Dr. Layla Al Hassan", "Dr. Omar Nasser", "Dr. Maya Saleh", "Dr. Layla Al Hassan"].map((name, i) => <article className="admin-booking-row" key={`${name}-${i}`}><div className={`doctor-avatar avatar-${i % 3 === 0 ? "rose" : i % 3 === 1 ? "mint" : "lavender"}`}>{["LH", "ON", "MS", "LH"][i]}</div><div><strong>{lang === "ar" ? ["د. ليلى الحسن", "د. عمر ناصر", "د. مايا صالح", "د. ليلى الحسن"][i] : name}</strong><small>{lang === "ar" ? `مريض ${["محمد العلي", "نور خليل", "جيمس باركر", "سارة منصور"][i]}` : `Patient ${["Mohammad Ali", "Noor Khalil", "James Parker", "Sara Mansour"][i]}`}</small><small>{`${9 + i}:30 AM · ${i === 1 && lang === "ar" ? t.pending : t.confirmedStatus}`}</small></div><button className="more-button" onClick={onNotify}>···</button></article>)}</section>;
}

function PeopleList({ title, lang, t, onOpen, onBack }: { title: string; lang: Lang; t: any; onOpen: () => void; onBack: () => void }) {
  const [query, setQuery] = useState("");
  const people = lang === "ar" ? ["محمد العلي", "نور خليل", "جيمس باركر", "سارة منصور"] : ["Mohammad Ali", "Noor Khalil", "James Parker", "Sara Mansour"];
  const visible = people.filter((name) => name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <section className="screen sub-screen"><ScreenTitle title={title} onBack={onBack} rtl={lang === "ar"} /><div className="search-box doctor-search"><MagnifyingGlassIcon width="18" height="18" /><KeyboardInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={lang === "ar" ? "ابحث بالاسم أو رقم الملف" : "Search by name or record ID"} /><button onClick={onOpen}><PlusIcon width="16" height="16" /></button></div><div className="people-summary"><span><strong>146</strong><small>{t.myPatients}</small></span><span><strong>12</strong><small>{lang === "ar" ? "زيارات اليوم" : "Visits today"}</small></span></div><div className="section-heading"><h2>{lang === "ar" ? "قائمة المرضى" : "Patient directory"}<span className="count-tag">146</span></h2><button className="text-button">{t.filters}</button></div>{visible.length ? visible.map((name, i) => <button className="person-list-row" key={name} onClick={onOpen}><span className={`patient-avatar patient-${i}`}>{name.slice(0, 1)}</span><span><strong>{name}</strong><small>{lang === "ar" ? `آخر زيارة: ${["اليوم", "أمس", "15 نوفمبر", "12 نوفمبر"][i]}` : `Last visit: ${["Today", "Yesterday", "Nov 15", "Nov 12"][i]}`}</small></span><span className={`patient-status-dot status-${i % 3}`} /><ChevronRightIcon className="arrow-icon" width="16" height="16" /></button>) : <div className="empty-state"><MagnifyingGlassIcon width="24" height="24" /><strong>{t.noResults}</strong></div>}</section>;
}

function WorkspaceProfile({ role, lang, t, photo, onPhotoChange, onNotify, onBack, onAction }: { role: Role; lang: Lang; t: any; photo: string; onPhotoChange: (photo: string) => void; onNotify: () => void; onBack: () => void; onAction: (action: string) => void }) {
  const doctor = role === "doctor";
  const name = doctor ? (lang === "ar" ? "د. ليلى الحسن" : "Dr. Layla Al Hassan") : (lang === "ar" ? "مدير النظام" : "Platform administrator");
  const specialtiesTitle = lang === "ar" ? "التخصصات والشهادات" : "Specialties & credentials";
  const items: [typeof CalendarIcon, string, string][] = doctor
    ? [[CalendarIcon, t.manageBookings, "appointments"], [PersonIcon, t.myPatients, "patients"], [IdCardIcon, specialtiesTitle, "credentials"], [MixerHorizontalIcon, t.settings, "settings"], [ChatBubbleIcon, t.help, "help"]]
    : [[PersonIcon, t.manageDoctors, "doctors"], [AvatarIcon, t.managePatients, "patients"], [CalendarIcon, t.manageBookings, "appointments"], [ActivityLogIcon, t.manageServices, "services"], [MixerHorizontalIcon, t.settings, "settings"]];
  return <section className="screen sub-screen"><ScreenTitle title={t.profileTitle} onBack={onBack} rtl={lang === "ar"} /><div className="profile-card"><ProfilePhotoField lang={lang} photo={doctor ? photo : ""} initials={doctor ? "LH" : "AD"} label={lang === "ar" ? "تغيير الصورة الشخصية" : "Change profile photo"} onChange={onPhotoChange} className={doctor ? "doctor-profile-avatar" : "admin-profile-avatar"} /><div><strong>{name}</strong><small>{doctor ? (lang === "ar" ? "طبيبة قلب · مركز الشفاء" : "Cardiologist · Al Shifa Center") : "admin@doctorplus.app"}</small></div><button className="edit-button" onClick={() => doctor ? onAction("credentials") : onNotify()}>{t.edit}</button></div><div className="workspace-status"><span className="live-dot" /><span><strong>{doctor ? (lang === "ar" ? "متاح للحجوزات" : "Available for bookings") : (lang === "ar" ? "صلاحيات كاملة" : "Full access")}</strong><small>{doctor ? (lang === "ar" ? "يظهر ملفك للمرضى الآن" : "Your profile is visible to patients") : (lang === "ar" ? "إدارة آمنة للمنصة" : "Secure platform administration")}</small></span><button onClick={() => doctor ? onAction("settings") : onNotify()}>{lang === "ar" ? "تعديل" : "Edit"}</button></div><p className="menu-label">{doctor ? (lang === "ar" ? "ملف الطبيب" : "Doctor profile") : (lang === "ar" ? "إعدادات الإدارة" : "Admin settings")}</p><div className="profile-menu">{items.map(([Icon, label, action]) => <button className="profile-menu-item" key={action} onClick={() => onAction(action)}><span className="profile-menu-icon"><Icon width="17" height="17" /></span><span>{label}</span><ChevronRightIcon className="arrow-icon" width="17" height="17" /></button>)}</div><div className="profile-safe"><CheckIcon width="15" height="15" /> {t.accountSafety}</div><button className="signout-button" onClick={() => doctor ? onNotify() : onNotify()}>{t.signOut}</button></section>;
}

function optimizeProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("image"));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("size"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("decode"));
      image.onload = () => {
        const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("canvas"));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", .82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function ProfilePhotoField({ lang, photo, initials, label, onChange, className = "" }: { lang: Lang; photo: string; initials: string; label: string; onChange: (photo: string) => void; className?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const ar = lang === "ar";
  return <label className="profile-photo-field" title={label}>
    <input type="file" accept="image/*" aria-label={label} disabled={busy} onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (!file) return; setBusy(true); setError(""); void optimizeProfilePhoto(file).then(onChange).catch((reason: Error) => setError(reason.message === "size" ? (ar ? "اختر صورة أصغر من 8 ميغابايت." : "Choose an image smaller than 8 MB.") : (ar ? "تعذر تحميل الصورة. جرّب ملف صورة آخر." : "Could not load that image. Try another photo."))).finally(() => setBusy(false)); }} />
    <span className={`profile-avatar ${className}`}>{photo ? <img src={photo} alt="" /> : initials}</span><span className="profile-photo-edit"><ImageIcon width="12" height="12" /></span>{busy && <span className="photo-uploading" />}{error && <span className="photo-upload-error" role="alert">{error}</span>}
  </label>;
}

function HealthRecordsScreen({ lang, section, entries, onBack, onChange }: { lang: Lang; section: HealthRecordSection; entries: HealthRecordEntry[]; onBack: () => void; onChange: (entries: HealthRecordEntry[]) => void }) {
  const ar = lang === "ar";
  const title = section === "prescriptions" ? (ar ? "الوصفات الطبية" : "Prescriptions") : section === "results" ? (ar ? "نتائج التحاليل" : "Lab results") : section === "records" ? (ar ? "السجلات الطبية" : "Medical records") : (ar ? "الحساسية" : "Allergies");
  const [draft, setDraft] = useState<HealthRecordEntry | null>(null);
  const [saved, setSaved] = useState(false);
  const labels = section === "prescriptions"
    ? { title: ar ? "اسم الدواء" : "Medication", detail: ar ? "الجرعة والطبيب" : "Dose and prescriber", date: ar ? "تاريخ انتهاء الوصفة" : "Prescription expiry", status: ar ? "حالة الوصفة" : "Prescription status", add: ar ? "إضافة وصفة" : "Add prescription", empty: ar ? "لا توجد وصفات بعد. أضف دواءك لتبقى تعليماته منظمة." : "No prescriptions yet. Add a medication to keep its instructions organized." }
    : section === "results"
      ? { title: ar ? "اسم التحليل" : "Test name", detail: ar ? "النتيجة والمختبر" : "Result and lab", date: ar ? "تاريخ التحليل" : "Test date", status: ar ? "حالة النتيجة" : "Result status", add: ar ? "إضافة نتيجة تحليل" : "Add lab result", empty: ar ? "لا توجد نتائج محفوظة. أضف نتيجة التحليل أو تفاصيلها." : "No results saved. Add a test result or its details." }
      : section === "records"
        ? { title: ar ? "عنوان السجل" : "Record title", detail: ar ? "الطبيب أو تفاصيل الزيارة" : "Doctor or visit details", date: ar ? "تاريخ السجل" : "Record date", status: ar ? "نوع السجل" : "Record type", add: ar ? "إضافة سجل طبي" : "Add medical record", empty: ar ? "لا توجد سجلات محفوظة. أضف تفاصيل زيارة أو تقرير طبي." : "No records saved. Add a visit summary or report." }
        : { title: ar ? "اسم المادة المسببة للحساسية" : "Allergen", detail: ar ? "ردة الفعل أو ملاحظات" : "Reaction or notes", date: ar ? "تاريخ الإضافة" : "Date added", status: ar ? "درجة الحساسية" : "Severity", add: ar ? "إضافة حساسية" : "Add allergy", empty: ar ? "لم تتم إضافة حساسيات. أضف أي حساسية معروفة لتظهر ضمن ملفك الصحي." : "No allergies added. Add known allergies to keep them visible in your health profile." };
  const startNew = () => { setSaved(false); setDraft({ id: "", title: "", detail: "", date: "2026-11-19", status: section === "allergies" ? (ar ? "متوسطة" : "Moderate") : section === "prescriptions" ? (ar ? "نشطة" : "Active") : section === "results" ? (ar ? "جاهزة" : "Ready") : (ar ? "زيارة" : "Visit") }); };
  const saveEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    onChange(draft.id ? entries.map((entry) => entry.id === draft.id ? draft : entry) : [{ ...draft, id: `health-${Date.now()}` }, ...entries]);
    setDraft(null);
    setSaved(true);
  };
  return <section className="screen sub-screen health-record-screen">
    <ScreenTitle title={title} onBack={onBack} rtl={ar} />
    <p className="screen-intro">{section === "prescriptions" ? (ar ? "تابع أدويتك وتعليماتها وتواريخها في مكان واحد." : "Keep medication instructions and dates together.") : section === "results" ? (ar ? "راجع نتائجك وأضف ملاحظاتك للعودة إليها لاحقاً." : "Review test results and save notes for later.") : section === "records" ? (ar ? "نظم ملخصات الزيارات والتقارير الصحية." : "Organize visit summaries and health reports.") : (ar ? "أدر معلومات الحساسية وردود الفعل المعروفة." : "Manage known allergies and reactions.")}</p>
    <div className="record-summary-card"><span className="health-item-icon"><HealthIconByIndex index={section === "prescriptions" ? 0 : section === "results" ? 1 : section === "records" ? 2 : 3} /></span><div><strong>{ar ? "ملفك الصحي" : "Your health record"}</strong><small>{ar ? `لديك ${entries.length} عناصر محفوظة في هذا القسم` : `${entries.length} saved ${entries.length === 1 ? "item" : "items"} in this section`}</small></div><span className="record-count">{entries.length}</span></div>
    {entries.length ? <div className="health-record-list">{entries.map((entry) => <article className="health-record-card" key={entry.id}><div className="health-record-card-top"><span className="health-record-dot"><CheckIcon width="14" height="14" /></span><span className="health-record-status">{healthRecordStatus(entry.status, lang)}</span><time>{entry.date}</time></div><strong>{healthRecordSeedTitle(entry.id, entry.title, lang)}</strong><p>{healthRecordSeedDetail(entry.id, entry.detail, lang)}</p><div className="health-record-actions"><button className="edit-button" onClick={() => { setSaved(false); setDraft({ ...entry }); }}>{ar ? "تعديل" : "Edit"}</button><button className="remove-item-button" aria-label={ar ? `حذف ${entry.title}` : `Delete ${entry.title}`} onClick={() => { onChange(entries.filter((item) => item.id !== entry.id)); setSaved(false); }}><Cross2Icon width="15" height="15" /></button></div></article>)}</div> : <div className="health-record-empty"><span><ClipboardIcon width="22" height="22" /></span><strong>{section === "allergies" && !entries.length ? (ar ? "لا توجد حساسية مسجلة" : "No allergies recorded") : (ar ? "لا توجد عناصر هنا بعد" : "Nothing here yet")}</strong><p>{labels.empty}</p></div>}
    {draft && <form className="workspace-form health-record-editor" onSubmit={saveEntry}><div className="section-heading"><h2>{draft.id ? (ar ? "تعديل البيانات" : "Edit details") : labels.add}</h2><button type="button" className="text-button" onClick={() => setDraft(null)}>{ar ? "إلغاء" : "Cancel"}</button></div><label>{labels.title}<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required placeholder={section === "allergies" ? (ar ? "مثال: البنسلين" : "e.g. Penicillin") : ""} /></label><label>{labels.detail}<textarea value={draft.detail} onChange={(event) => setDraft({ ...draft, detail: event.target.value })} rows={3} placeholder={section === "prescriptions" ? (ar ? "مثال: كبسولة واحدة يومياً" : "e.g. One capsule daily") : ""} /></label><label>{labels.date}<input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} required /></label><label>{labels.status}<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>{(section === "allergies" ? (ar ? ["خفيفة", "متوسطة", "شديدة"] : ["Mild", "Moderate", "Severe"]) : section === "prescriptions" ? (ar ? ["نشطة", "منتهية", "موقوفة"] : ["Active", "Expired", "Paused"]) : section === "results" ? (ar ? ["جاهزة", "بانتظار النتيجة", "تحتاج مراجعة"] : ["Ready", "Pending", "Review needed"]) : (ar ? ["زيارة", "تقرير", "تصوير طبي"] : ["Visit", "Report", "Imaging"])).map((status) => <option key={status}>{status}</option>)}</select></label><button className="primary-button full-button" type="submit">{ar ? "حفظ البيانات" : "Save details"}</button></form>}
    <button className="secondary-button add-family-button" onClick={startNew}><PlusIcon width="16" height="16" />{labels.add}</button>{saved && <div className="settings-note"><CheckIcon width="15" height="15" />{ar ? "تم حفظ التغييرات على هذا الجهاز." : "Changes saved on this device."}</div>}<div className="settings-note"><HeartIcon width="15" height="15" />{ar ? "بيانات تجريبية محفوظة محلياً؛ لا تُعد بديلاً عن السجل الطبي الرسمي." : "Demo data saved locally; it is not an official medical record."}</div>
  </section>;
}

function WellnessScreen({ lang, checks, onBack, onToggle, onEditHealth }: { lang: Lang; checks: boolean[]; onBack: () => void; onToggle: (index: number) => void; onEditHealth: () => void }) {
  const ar = lang === "ar";
  const tasks = ar ? ["شرب الماء بانتظام", "الحركة أو المشي اليوم", "مراجعة مواعيد أدويتي"] : ["Drink water regularly", "Move or take a walk today", "Review my medication schedule"];
  const tips = ar ? [["النوم", "حاول تثبيت وقت النوم والاستيقاظ لدعم روتين يومي منتظم."], ["الحركة", "أضف فترات حركة قصيرة إلى يومك بما يناسب قدرتك."], ["المتابعة", "دوّن قياساتك وأسئلتك لتناقشها في موعدك القادم."]] : [["Sleep", "A steady sleep and wake schedule can support a consistent daily routine."], ["Movement", "Add short movement breaks to your day when they suit your ability."], ["Follow-up", "Write down your measurements and questions for your next visit."]];
  return <section className="screen sub-screen wellness-screen"><ScreenTitle title={ar ? "نصائح صحية" : "Health tips"} onBack={onBack} rtl={ar} /><p className="screen-intro">{ar ? "خطوات يومية بسيطة لمساعدتك على متابعة عاداتك الصحية." : "Simple daily steps to help you keep track of healthy routines."}</p><div className="wellness-progress-card"><span className="wellness-progress-icon"><StarFilledIcon width="18" height="18" /></span><div><strong>{ar ? "متابعة اليوم" : "Today's check-in"}</strong><small>{ar ? `أنجزت ${checks.filter(Boolean).length} من ${tasks.length} خطوات` : `${checks.filter(Boolean).length} of ${tasks.length} steps completed`}</small></div><span className="wellness-progress-number">{checks.filter(Boolean).length}/{tasks.length}</span></div><div className="wellness-check-list">{tasks.map((task, index) => <button className={`wellness-check-row ${checks[index] ? "complete" : ""}`} key={task} onClick={() => onToggle(index)} aria-pressed={checks[index]}><span className="wellness-checkmark"><CheckIcon width="14" height="14" /></span><strong>{task}</strong><small>{checks[index] ? (ar ? "تم" : "Done") : (ar ? "تحديد" : "Mark")}</small></button>)}</div><div className="wellness-tips-heading"><h2>{ar ? "إرشادات عامة" : "Everyday guidance"}</h2><span>{ar ? "للعافية" : "Wellbeing"}</span></div><div className="wellness-tip-list">{tips.map(([title, body], index) => <article className="wellness-tip-card" key={title}><span className={`wellness-tip-icon tint-${index}`}><HealthIconByIndex index={index} /></span><div><strong>{title}</strong><p>{body}</p></div></article>)}</div><button className="secondary-button wellness-edit-button" onClick={onEditHealth}><ActivityLogIcon width="16" height="16" />{ar ? "تحديث مؤشرات صحتي" : "Update my health metrics"}</button><div className="settings-note"><HeartIcon width="15" height="15" />{ar ? "هذه إرشادات عامة ولا تغني عن استشارة الطبيب." : "General guidance only; it does not replace advice from your clinician."}</div></section>;
}

function healthRecordStatus(status: string, lang: Lang) {
  const translations: Record<string, [string, string]> = { Active: ["نشطة", "Active"], Ready: ["جاهزة", "Ready"], Pending: ["بانتظار النتيجة", "Pending"], "Review needed": ["تحتاج مراجعة", "Review needed"], Visit: ["زيارة", "Visit"], Report: ["تقرير", "Report"], Imaging: ["تصوير طبي", "Imaging"], Mild: ["خفيفة", "Mild"], Moderate: ["متوسطة", "Moderate"], Severe: ["شديدة", "Severe"], Expired: ["منتهية", "Expired"], Paused: ["موقوفة", "Paused"], "نشطة": ["نشطة", "Active"], "جاهزة": ["جاهزة", "Ready"], "بانتظار النتيجة": ["بانتظار النتيجة", "Pending"], "تحتاج مراجعة": ["تحتاج مراجعة", "Review needed"], "زيارة": ["زيارة", "Visit"], "تقرير": ["تقرير", "Report"], "تصوير طبي": ["تصوير طبي", "Imaging"], "خفيفة": ["خفيفة", "Mild"], "متوسطة": ["متوسطة", "Moderate"], "شديدة": ["شديدة", "Severe"], "منتهية": ["منتهية", "Expired"], "موقوفة": ["موقوفة", "Paused"] };
  const pair = translations[status];
  return pair ? pair[lang === "ar" ? 0 : 1] : status;
}

function healthRecordSeedTitle(id: string, fallback: string, lang: Lang) {
  const values: Record<string, [string, string]> = { "rx-vitamin-d": ["فيتامين D3", "Vitamin D3"], "lab-cbc": ["تعداد الدم الكامل", "Complete blood count"], "visit-cardio": ["فحص القلب", "Cardiology check-up"] };
  const value = values[id];
  return value && value.includes(fallback) ? value[lang === "ar" ? 0 : 1] : fallback;
}

function healthRecordSeedDetail(id: string, fallback: string, lang: Lang) {
  const values: Record<string, [string, string]> = {
    "rx-vitamin-d": ["كبسولة واحدة · مرة يومياً · د. ليلى", "1 capsule · once daily · Dr. Layla"],
    "lab-cbc": ["ضمن المعدل الطبيعي · الهيموغلوبين 13.4 غ/دل", "Within normal range · Hemoglobin 13.4 g/dL"],
    "visit-cardio": ["د. ليلى الحسن · مركز الشفاء الطبي", "Dr. Layla Al Hassan · Al Shifa Medical Center"],
  };
  const value = values[id];
  return value && value.includes(fallback) ? value[lang === "ar" ? 0 : 1] : fallback;
}

function FamilyMembersScreen({ lang, members, setMembers, onBack }: { lang: Lang; members: FamilyMember[]; setMembers: (members: FamilyMember[]) => void; onBack: () => void }) {
  const ar = lang === "ar";
  const [draft, setDraft] = useState<FamilyMember | null>(null);
  const [saved, setSaved] = useState(false);
  const relationLabels: Record<FamilyMember["relation"], string> = { spouse: ar ? "زوج / زوجة" : "Spouse", child: ar ? "ابن / ابنة" : "Child", parent: ar ? "أحد الوالدين" : "Parent", other: ar ? "صلة قرابة أخرى" : "Other" };
  const startNew = () => { setSaved(false); setDraft({ id: "", name: "", relation: "child", birthDate: "" }); };
  const saveMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const next = draft.id ? members.map((member) => member.id === draft.id ? draft : member) : [...members, { ...draft, id: `family-${Date.now()}` }];
    setMembers(next);
    setDraft(null);
    setSaved(true);
  };
  return <section className="screen sub-screen"><ScreenTitle title={ar ? "أفراد العائلة" : "Family members"} onBack={onBack} rtl={ar} /><p className="screen-intro">{ar ? "أدر ملفات أفراد عائلتك ومعلوماتهم الأساسية." : "Manage family profiles and their basic details."}</p>
    <div className="family-member-list">{members.map((member) => <article className="family-member-card" key={member.id}><span className="family-member-avatar"><PersonIcon width="18" height="18" /></span><div className="family-member-details"><strong>{member.name}</strong><small>{relationLabels[member.relation]}{member.birthDate ? ` · ${member.birthDate}` : ""}</small></div><button className="edit-button" aria-label={ar ? `تعديل ${member.name}` : `Edit ${member.name}`} onClick={() => { setSaved(false); setDraft({ ...member }); }}>{ar ? "تعديل" : "Edit"}</button><button className="remove-item-button" aria-label={ar ? `حذف ${member.name}` : `Remove ${member.name}`} onClick={() => { setMembers(members.filter((item) => item.id !== member.id)); setSaved(false); }}><Cross2Icon width="15" height="15" /></button></article>)}</div>
    {draft && <form className="workspace-form family-editor" onSubmit={saveMember}><div className="section-heading"><h2>{draft.id ? (ar ? "تعديل فرد" : "Edit family member") : (ar ? "إضافة فرد جديد" : "Add a family member")}</h2><button type="button" className="text-button" onClick={() => setDraft(null)}>{ar ? "إلغاء" : "Cancel"}</button></div><label>{ar ? "الاسم الكامل" : "Full name"}<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></label><label>{ar ? "صلة القرابة" : "Relationship"}<select value={draft.relation} onChange={(e) => setDraft({ ...draft, relation: e.target.value as FamilyMember["relation"] })}>{Object.entries(relationLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>{ar ? "تاريخ الميلاد" : "Date of birth"}<input type="date" value={draft.birthDate} onChange={(e) => setDraft({ ...draft, birthDate: e.target.value })} required /></label><button className="primary-button full-button" type="submit">{ar ? "حفظ بيانات الفرد" : "Save family member"}</button></form>}
    <button className="secondary-button add-family-button" onClick={startNew}><PlusIcon width="16" height="16" />{ar ? "إضافة فرد من العائلة" : "Add family member"}</button>{saved && <div className="settings-note"><CheckIcon width="15" height="15" />{ar ? "تم حفظ قائمة العائلة على هذا الجهاز." : "Family list saved on this device."}</div>}<div className="settings-note"><HeartIcon width="15" height="15" />{ar ? "بيانات تجريبية محفوظة محلياً على هذا الجهاز." : "Demo data is saved locally on this device."}</div>
  </section>;
}

function InsuranceScreen({ lang, data, setData, onBack }: { lang: Lang; data: InsuranceData; setData: (data: InsuranceData) => void; onBack: () => void }) {
  const ar = lang === "ar";
  const [draft, setDraft] = useState(data);
  const [saved, setSaved] = useState(false);
  return <section className="screen sub-screen"><ScreenTitle title={ar ? "التأمين الصحي" : "Health insurance"} onBack={onBack} rtl={ar} /><p className="screen-intro">{ar ? "حدّث بيانات وثيقة التأمين لتكون جاهزة عند حجز الموعد." : "Keep your insurance details ready when booking a visit."}</p>
    <div className="insurance-preview"><span className="insurance-preview-icon"><CheckIcon width="19" height="19" /></span><div><small>{ar ? "وثيقة التأمين" : "INSURANCE PLAN"}</small><strong>{draft.provider || (ar ? "شركة التأمين" : "Insurance provider")}</strong><span>{ar ? "رقم العضوية" : "Member ID"} · {draft.memberId || "—"}</span></div><span className="insurance-active">{ar ? "نشط" : "Active"}</span></div>
    <form className="workspace-form insurance-form" onSubmit={(e) => { e.preventDefault(); setData(draft); localStorage.setItem("doctor-plus-insurance", JSON.stringify(draft)); setSaved(true); }}><label>{ar ? "شركة التأمين" : "Insurance provider"}<input value={draft.provider} onChange={(e) => { setDraft({ ...draft, provider: e.target.value }); setSaved(false); }} required /></label><label>{ar ? "رقم العضوية" : "Member ID"}<input value={draft.memberId} onChange={(e) => { setDraft({ ...draft, memberId: e.target.value }); setSaved(false); }} required /></label><label>{ar ? "رقم الوثيقة" : "Policy number"}<input value={draft.policyNumber} onChange={(e) => { setDraft({ ...draft, policyNumber: e.target.value }); setSaved(false); }} required /></label><label>{ar ? "نوع التغطية" : "Coverage type"}<select value={draft.coverage} onChange={(e) => { setDraft({ ...draft, coverage: e.target.value }); setSaved(false); }}><option value="individual">{ar ? "فردية" : "Individual"}</option><option value="family">{ar ? "عائلية" : "Family"}</option><option value="dependent">{ar ? "تابع" : "Dependent"}</option></select></label><label>{ar ? "تاريخ انتهاء الوثيقة" : "Policy expiry date"}<input type="date" value={draft.expiresAt} onChange={(e) => { setDraft({ ...draft, expiresAt: e.target.value }); setSaved(false); }} required /></label><button className="primary-button full-button" type="submit">{saved ? (ar ? "تم حفظ التأمين" : "Insurance saved") : (ar ? "حفظ بيانات التأمين" : "Save insurance details")}</button></form>
    <div className="settings-note"><CheckIcon width="15" height="15" />{ar ? "بيانات العرض تجريبية ولا يتم التحقق من التغطية لدى شركة التأمين." : "Demo information only; coverage is not verified with an insurer."}</div>
  </section>;
}

function PatientSettingsScreen({ lang, setLang, settings, setSettings, onBack }: { lang: Lang; setLang: (lang: Lang) => void; settings: PatientSettingsData; setSettings: (settings: PatientSettingsData) => void; onBack: () => void }) {
  const ar = lang === "ar";
  const rows = [
    [BellIcon, "appointmentReminders", ar ? "تذكير بالمواعيد" : "Appointment reminders", ar ? "تنبيه قبل موعدك القادم." : "Get a reminder before your next visit."],
    [TimerIcon, "medicationReminders", ar ? "تذكير بالأدوية" : "Medication reminders", ar ? "تذكير بمواعيد جرعاتك." : "Reminders for your medication schedule."],
    [SpeakerModerateIcon, "biometricLogin", ar ? "الدخول السريع" : "Quick sign-in", ar ? "تفضيل تسجيل دخول سريع على هذا الجهاز." : "Prefer faster sign-in on this device."],
    [HeartIcon, "shareWithDoctor", ar ? "مشاركة ملخص الصحة" : "Share health summary", ar ? "السماح بعرض ملخصك الصحي في الاستشارات التجريبية." : "Allow your summary in demo consultations."],
  ] as const;
  return <section className="screen sub-screen"><ScreenTitle title={ar ? "إعدادات الحساب" : "Account settings"} onBack={onBack} rtl={ar} /><p className="screen-intro">{ar ? "خصص طريقة استخدامك للتطبيق وتذكيراتك." : "Choose how the app and your reminders work."}</p>
    <div className="language-setting-card"><span className="workspace-setting-icon"><SpeakerModerateIcon width="17" height="17" /></span><span><strong>{ar ? "لغة التطبيق" : "App language"}</strong><small>{ar ? "اختر لغة العرض المفضلة." : "Choose your preferred display language."}</small></span><select aria-label={ar ? "لغة التطبيق" : "App language"} value={lang} onChange={(e) => setLang(e.target.value as Lang)}><option value="ar">العربية</option><option value="en">English</option></select></div>
    <div className="workspace-settings-list">{rows.map(([Icon, key, title, description]) => <div className="workspace-setting-row" key={key}><span className="workspace-setting-icon"><Icon width="17" height="17" /></span><span className="workspace-setting-copy"><strong>{title}</strong><small>{description}</small></span><button className={`toggle-switch ${settings[key] ? "on" : ""}`} role="switch" aria-checked={settings[key]} aria-label={title} onClick={() => setSettings({ ...settings, [key]: !settings[key] })}><i /></button></div>)}</div>
    <div className="settings-note"><CheckIcon width="15" height="15" />{ar ? "تُحفظ تفضيلاتك محلياً على هذا الجهاز." : "Your preferences are saved locally on this device."}</div>
  </section>;
}

function NotificationPreferencesScreen({ lang, preferences, setPreferences, onBack }: { lang: Lang; preferences: NotificationPreferences; setPreferences: (preferences: NotificationPreferences) => void; onBack: () => void }) {
  const ar = lang === "ar";
  const rows = [
    [CalendarIcon, "appointmentUpdates", ar ? "تحديثات المواعيد" : "Appointment updates", ar ? "تأكيد أو تغيير أو تذكير بالموعد." : "Confirmations, changes, and reminders."],
    [ChatBubbleIcon, "doctorMessages", ar ? "رسائل الطبيب" : "Doctor messages", ar ? "إشعار عند وصول رد جديد من الطبيب." : "Get notified when your doctor replies."],
    [ActivityLogIcon, "labResults", ar ? "نتائج التحاليل" : "Lab results", ar ? "إشعار عند إضافة نتيجة جديدة إلى سجلك." : "Get notified when a new result is added."],
    [TimerIcon, "medicationReminders", ar ? "مواعيد الأدوية" : "Medication reminders", ar ? "تنبيه بموعد الجرعة التي سجلتها." : "Reminders for doses you have recorded."],
  ] as const;
  return <section className="screen sub-screen"><ScreenTitle title={ar ? "الإشعارات" : "Notifications"} onBack={onBack} rtl={ar} /><p className="screen-intro">{ar ? "اختر التنبيهات التي تريد ظهورها في التطبيق." : "Choose which alerts you want to receive in the app."}</p>
    <div className="workspace-settings-list">{rows.map(([Icon, key, title, description]) => <div className="workspace-setting-row" key={key}><span className="workspace-setting-icon"><Icon width="17" height="17" /></span><span className="workspace-setting-copy"><strong>{title}</strong><small>{description}</small></span><button className={`toggle-switch ${preferences[key] ? "on" : ""}`} role="switch" aria-checked={preferences[key]} aria-label={title} onClick={() => setPreferences({ ...preferences, [key]: !preferences[key] })}><i /></button></div>)}</div>
    <div className="notification-preview"><span className="notification-preview-icon"><BellIcon width="17" height="17" /></span><div><strong>{ar ? "معاينة تذكير" : "Reminder preview"}</strong><p>{ar ? "موعدك مع د. ليلى غداً الساعة 10:30 صباحاً." : "Your appointment with Dr. Layla is tomorrow at 10:30 AM."}</p><small>{ar ? "سيظهر هذا التنبيه داخل التطبيق عند تفعيله." : "This alert appears in app when enabled."}</small></div></div>
  </section>;
}

function DoctorCredentials({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const ar = lang === "ar";
  const fallback = { specialty: "Cardiology", license: "TR-114082", experience: "12", clinic: "Al Shifa Medical Center", certificates: ["Cardiology Board Certification", "Advanced Cardiac Life Support"] };
  const [data, setData] = useState(() => readLocal("doctor-plus-doctor-credentials", fallback));
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const save = () => {
    localStorage.setItem("doctor-plus-doctor-credentials", JSON.stringify(data));
    setSaved(true);
  };
  return <section className="screen sub-screen"><ScreenTitle title={ar ? "التخصصات والشهادات" : "Specialties & credentials"} onBack={onBack} rtl={ar} />
    <p className="screen-intro">{ar ? "حدّث المعلومات التي تظهر للمرضى على ملفك الطبي." : "Update the professional details shown on your doctor profile."}</p>
    <div className="credential-status"><span className="verified"><CheckIcon width="13" height="13" /></span><span><strong>{ar ? "ملف مهني موثّق" : "Professional profile verified"}</strong><small>{ar ? "بيانات تجريبية — لا تُرسل إلى جهة اعتماد" : "Demo details — not submitted to a licensing body"}</small></span></div>
    <div className="workspace-form">
      <label>{ar ? "التخصص الرئيسي" : "Primary specialty"}<select value={data.specialty} onChange={(e) => { setData({ ...data, specialty: e.target.value }); setSaved(false); }}>{specialties.map((item) => <option value={item} key={item}>{specialtyLabel(item, lang)}</option>)}</select></label>
      <label>{ar ? "رقم الترخيص المهني" : "Professional license number"}<input value={data.license} onChange={(e) => { setData({ ...data, license: e.target.value }); setSaved(false); }} /></label>
      <label>{ar ? "سنوات الخبرة" : "Years of experience"}<input type="number" min="0" value={data.experience} onChange={(e) => { setData({ ...data, experience: e.target.value }); setSaved(false); }} /></label>
      <label>{ar ? "العيادة أو المركز" : "Clinic or medical center"}<input value={data.clinic} onChange={(e) => { setData({ ...data, clinic: e.target.value }); setSaved(false); }} /></label>
    </div>
    <div className="section-heading"><h2>{ar ? "الشهادات" : "Certificates"}<span className="count-tag">{data.certificates.length}</span></h2></div>
    <div className="credential-list">{data.certificates.map((certificate, index) => <div className="credential-item" key={`${certificate}-${index}`}><span className="credential-icon"><FileTextIcon width="16" height="16" /></span><strong>{certificate}</strong><button aria-label={ar ? "حذف الشهادة" : "Remove certificate"} onClick={() => { setData({ ...data, certificates: data.certificates.filter((_, i) => i !== index) }); setSaved(false); }}><Cross2Icon width="15" height="15" /></button></div>)}</div>
    <form className="add-credential-form" onSubmit={(e) => { e.preventDefault(); const value = draft.trim(); if (value) { setData({ ...data, certificates: [...data.certificates, value] }); setDraft(""); setSaved(false); } }}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={ar ? "أضف شهادة جديدة" : "Add a certificate"} /><button type="submit" aria-label={ar ? "إضافة شهادة" : "Add certificate"}><PlusIcon width="17" height="17" /></button></form>
    <button className="primary-button full-button" onClick={save}>{saved ? (ar ? "تم الحفظ" : "Saved") : (ar ? "حفظ الملف المهني" : "Save professional profile")}</button>
  </section>;
}

function WorkspaceSettings({ lang, role, onBack }: { lang: Lang; role: Role; onBack: () => void }) {
  const ar = lang === "ar";
  const fallback = { acceptingAppointments: true, appointmentAlerts: true, messageAlerts: true, videoConsultations: true };
  const [settings, setSettings] = useState(() => readLocal(`doctor-plus-${role}-settings`, fallback));
  useEffect(() => { localStorage.setItem(`doctor-plus-${role}-settings`, JSON.stringify(settings)); }, [role, settings]);
  const rows = [
    ["acceptingAppointments", ar ? "استقبال مواعيد جديدة" : "Accepting new appointments", ar ? "أظهر فترات الحجز المتاحة للمرضى." : "Show your available booking times."],
    ["appointmentAlerts", ar ? "تنبيهات المواعيد" : "Appointment alerts", ar ? "تنبيه عند حجز موعد أو تغييره." : "Get notified when a visit is booked or changed."],
    ["messageAlerts", ar ? "تنبيهات رسائل المرضى" : "Patient message alerts", ar ? "تنبيه عند وصول رسالة جديدة." : "Get notified when a patient sends a message."],
    ["videoConsultations", ar ? "الاستشارات المرئية" : "Video consultations", ar ? "السماح بطلب مواعيد فيديو من ملفك." : "Allow patients to request video appointments."],
  ] as const;
  return <section className="screen sub-screen"><ScreenTitle title={ar ? "إعدادات مساحة الطبيب" : "Doctor workspace settings"} onBack={onBack} rtl={ar} /><p className="screen-intro">{ar ? "تحكّم بتوفّرك والتنبيهات التي تصلك." : "Manage your availability and notification preferences."}</p>
    <div className="workspace-settings-list">{rows.map(([key, title, description]) => <div className="workspace-setting-row" key={key}><span className="workspace-setting-icon"><MixerHorizontalIcon width="17" height="17" /></span><span className="workspace-setting-copy"><strong>{title}</strong><small>{description}</small></span><button className={`toggle-switch ${settings[key] ? "on" : ""}`} role="switch" aria-checked={settings[key]} aria-label={title} onClick={() => setSettings({ ...settings, [key]: !settings[key] })}><i /></button></div>)}</div>
    <div className="settings-note"><CheckIcon width="15" height="15" />{ar ? "تُحفظ تفضيلات هذه النسخة محلياً على هذا الجهاز." : "This prototype saves preferences locally on this device."}</div>
  </section>;
}

function SupportCenter({ lang, role, onBack }: { lang: Lang; role: Role; onBack: () => void }) {
  const ar = lang === "ar";
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("appointments");
  const [submitted, setSubmitted] = useState(false);
  const [requestCount, setRequestCount] = useState(() => (readLocal<{ message: string }[]>("doctor-plus-support-requests", [])).length);
  const questions = role === "patient" ? ar ? [
    ["كيف أعدّل أو ألغي موعداً؟", "افتح مواعيدي، واختر الموعد لمراجعة تفاصيله أو التواصل مع العيادة في النموذج التجريبي."],
    ["أين أجد نتائج تحاليلي؟", "افتح صحتي ثم نتائج التحاليل. بيانات هذه النسخة للعرض فقط."],
    ["كيف أضيف فرداً من عائلتي؟", "من حسابي اختر أفراد العائلة، ثم أضف الملف واحفظ بياناته على جهازك."],
  ] : [
    ["How do I change or cancel an appointment?", "Open Bookings and select a visit to review its details or contact the clinic in this demo."],
    ["Where can I find lab results?", "Open My health, then Lab results. This prototype uses demo records."],
    ["How do I add a family member?", "Open Profile, choose Family members, add a profile, and save it on this device."],
  ] : ar ? [
    ["كيف أعدّل أوقات دوامي؟", "من إعدادات مساحة الطبيب يمكنك تفعيل أو إيقاف استقبال المواعيد والتنبيهات."],
    ["كيف أضيف شهادة إلى ملفي؟", "افتح التخصصات والشهادات، أضف اسم الشهادة ثم احفظ الملف المهني."],
    ["كيف أتابع مرضاي؟", "افتح تبويب مرضاي من شريط التنقل أو من قائمة ملف الطبيب."],
  ] : [
    ["How do I change my availability?", "Use Doctor workspace settings to turn appointment availability and alerts on or off."],
    ["How do I add a certificate?", "Open Specialties & credentials, add the certificate name, then save your professional profile."],
    ["Where can I find my patients?", "Open My patients from the bottom navigation or your doctor profile menu."],
  ];
  return <section className="screen sub-screen"><ScreenTitle title={ar ? "المساعدة والدعم" : "Help & support"} onBack={onBack} rtl={ar} /><p className="screen-intro">{ar ? "إجابات سريعة ومكان لإرسال ملاحظاتك." : "Quick answers and a place to leave feedback."}</p>
    <div className="section-heading"><h2>{ar ? "الأسئلة الشائعة" : "Frequently asked questions"}</h2></div>
    <div className="support-faq-list">{questions.map(([question, answer], index) => <div className={`support-faq ${openFaq === index ? "open" : ""}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><strong>{question}</strong><PlusIcon width="16" height="16" /></button>{openFaq === index && <p>{answer}</p>}</div>)}</div>
    <form className="support-contact" onSubmit={(e) => { e.preventDefault(); if (!message.trim()) return; const requests = readLocal<{ message: string; category: string; createdAt: string }[]>("doctor-plus-support-requests", []); requests.unshift({ message: message.trim(), category, createdAt: new Date().toISOString() }); localStorage.setItem("doctor-plus-support-requests", JSON.stringify(requests)); setRequestCount(requests.length); setSubmitted(true); setMessage(""); }}><h2>{ar ? "أرسل طلب دعم" : "Send a support request"}</h2><p>{ar ? "حدد الموضوع واكتب التفاصيل لنحفظ طلبك في سجل الدعم المحلي." : "Choose a topic and describe it. Your request is saved in this demo."}</p><label className="support-category-label">{ar ? "موضوع الطلب" : "Request topic"}<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="appointments">{ar ? "المواعيد والحجوزات" : "Appointments & bookings"}</option><option value="account">{ar ? "الحساب والملف الشخصي" : "Account & profile"}</option><option value="health">{ar ? "السجل الصحي" : "Health record"}</option><option value="technical">{ar ? "مشكلة تقنية" : "Technical issue"}</option></select></label><textarea value={message} onChange={(e) => { setMessage(e.target.value); setSubmitted(false); }} placeholder={ar ? "اكتب تفاصيل طلبك..." : "Describe what you need help with..."} required /><button className="primary-button full-button" type="submit">{ar ? "إرسال الطلب" : "Submit request"}</button>{submitted && <span className="support-confirmation"><CheckIcon width="14" height="14" />{ar ? "تم تسجيل الطلب في النموذج التجريبي." : "Your request was recorded in this demo."}</span>}</form>
    <div className="support-history"><strong>{ar ? "طلبات الدعم المحفوظة" : "Saved support requests"}</strong><span>{requestCount} {ar ? "طلب" : (requestCount === 1 ? "request" : "requests")}</span></div>
  </section>;
}

function AuthScreen({ lang, t, role, setRole, onDone }: { lang: Lang; t: any; role: Role; setRole: (role: Role) => void; onDone: () => void }) {
  const [mode, setMode] = useState<"welcome" | "login" | "signup">("login");
  const [slide, setSlide] = useState(0);
  const keyboard = useKeyboard();
  const ar = lang === "ar";
  useEffect(() => {
    keyboard.hide();
    const scroll = document.querySelector<HTMLElement>(".app-scroll .mobile-scroll");
    if (scroll) scroll.scrollTop = 0;
  }, [mode]);
  const slides = ar
    ? [{ title: "صحتك أقرب مما تتخيل", detail: "احجز مع أطباء موثوقين، وتابع صحتك بكل سهولة.", icon: HeartIcon }, { title: "موعدك بخطوات بسيطة", detail: "اختر الطبيب والوقت المناسب واحصل على تأكيد فوري.", icon: CalendarIcon }, { title: "رعاية متكاملة لك ولعائلتك", detail: "ملف صحي، وصفات، نتائج مخبرية، واستشارات عن بُعد.", icon: PersonIcon }]
    : [{ title: "Better care, closer to you", detail: "Book trusted doctors and manage your health with ease.", icon: HeartIcon }, { title: "Appointments made simple", detail: "Choose a doctor and time, then get instant confirmation.", icon: CalendarIcon }, { title: "Care for you and your family", detail: "Health records, prescriptions, lab results, and online visits.", icon: PersonIcon }];
  const activeSlide = slides[slide];
  const roleNames = ar ? ["المريض", "الطبيب", "الإدارة"] : ["Patient", "Doctor", "Admin"];
  return <section className="screen auth-screen">
    <div className="auth-brand"><span className="brand-icon"><img src="/assets/doctor-plus-mark.svg" alt="" /></span><strong>{t.brand}</strong><button onClick={() => { keyboard.hide(); setMode(mode === "welcome" ? "login" : "welcome"); }}>{mode === "welcome" ? (ar ? "تخطي" : "Skip") : (ar ? "رجوع" : "Back")}</button></div>
    {mode === "welcome" ? <>
      <div className="onboarding-art"><div className="onboarding-halo" /><img src="/assets/doctors/layla.jpg" alt="Doctor" /><span className="onboarding-float"><CheckIcon width="15" height="15" /></span><span className="onboarding-calendar"><CalendarIcon width="17" height="17" /></span></div>
      <div className="onboarding-copy"><span className="onboarding-kicker">{ar ? "رعايتك تبدأ من هنا" : "Your health starts here"}</span><h1>{activeSlide.title}</h1><p>{activeSlide.detail}</p></div>
      <div className="onboarding-dots">{slides.map((_, i) => <button key={i} className={slide === i ? "active" : ""} onClick={() => setSlide(i)} aria-label={`${i + 1}`} />)}</div>
      <button className="primary-button full-button" onClick={() => { if (slide === slides.length - 1) { keyboard.hide(); setMode("login"); } else setSlide(slide + 1); }}>{slide === slides.length - 1 ? (ar ? "ابدأ الآن" : "Get started") : (ar ? "التالي" : "Continue")}<ChevronRightIcon className="arrow-icon" width="16" height="16" /></button>
      {slide === slides.length - 1 && <button className="auth-secondary" onClick={() => { keyboard.hide(); setMode("login"); }}>{ar ? "تسجيل الدخول" : "Log in"}</button>}
      <p className="auth-switch-copy">{ar ? "لديك حساب بالفعل؟" : "Already have an account?"} <button onClick={() => { keyboard.hide(); setMode("login"); }}>{ar ? "دخول" : "Log in"}</button></p>
      <div className="auth-role-picker"><small>{ar ? "أتابع بصفتي" : "Continue as"}</small>{(["patient", "doctor", "admin"] as Role[]).map((item, i) => <button key={item} className={role === item ? "active" : ""} onClick={() => setRole(item)}>{roleNames[i]}</button>)}</div>
    </> : <>
      <button className="back-button auth-back" onClick={() => { keyboard.hide(); setMode("welcome"); }} aria-label={ar ? "رجوع" : "Back"}>{ar ? <ChevronRightIcon width="19" height="19" /> : <ChevronLeftIcon width="19" height="19" />}</button>
      <div className="auth-form-heading"><span className="auth-form-icon"><HeartFilledIcon width="19" height="19" /></span><h1>{mode === "login" ? (ar ? "مرحباً بعودتك" : "Welcome back") : (ar ? "أنشئ حسابك" : "Create your account")}</h1><p>{mode === "login" ? (ar ? "سجّل دخولك لتكون رعايتك الصحية أقرب." : "Sign in to keep your care close at hand.") : (ar ? "ابدأ رحلة صحية أسهل لك ولعائلتك." : "Start a simpler health journey for you and your family.")}</p></div>
      <div className="auth-hero-card"><div className="auth-hero-copy"><span>{ar ? "رعاية أقرب إليك" : "CARE, CLOSER TO YOU"}</span><strong>{ar ? "صحتك تستحق اهتماماً أسهل" : "A simpler way to care for you"}</strong><small>{ar ? "أطباؤك ومواعيدك وملفك الصحي في مكان واحد." : "Doctors, appointments, and health records in one place."}</small><i><CheckIcon width="12" height="12" />{ar ? "خصوصية بياناتك أولويتنا" : "Your privacy comes first"}</i></div><div className="auth-hero-art"><span className="auth-hero-halo" /><img src="/assets/login-doctor-hero.jpg" alt={ar ? "طبيبة من فريق دكتور بلس" : "Doctor Plus care team doctor"} /><span className="auth-hero-badge"><HeartFilledIcon width="13" height="13" /></span></div></div>
      <div className="auth-role-picker auth-role-picker-cards"><small>{ar ? "أتابع بصفتي" : "CONTINUE AS"}</small>{(["patient", "doctor", "admin"] as Role[]).map((item, i) => { const Icon = [PersonIcon, AccessibilityIcon, AvatarIcon][i]; return <button type="button" key={item} className={role === item ? "active" : ""} aria-pressed={role === item} onClick={() => setRole(item)}><span><Icon width="16" height="16" /></span><strong>{roleNames[i]}</strong></button>; })}</div>
      <form className="auth-form" onSubmit={(e) => { e.preventDefault(); keyboard.hide(); onDone(); }}>
        {mode === "signup" && <label>{ar ? "الاسم الكامل" : "Full name"}<KeyboardInput required placeholder={ar ? "اكتب اسمك" : "Your name"} autoComplete="name" /></label>}
        <label>{ar ? "البريد الإلكتروني" : "Email address"}<KeyboardInput required type="email" placeholder="name@example.com" autoComplete="email" /></label>
        {mode === "signup" && <label>{ar ? "رقم الهاتف" : "Phone number"}<KeyboardInput required type="tel" placeholder={ar ? "+962 7X XXX XXXX" : "+1 (555) 000-0000"} autoComplete="tel" /></label>}
        <label>{ar ? "كلمة المرور" : "Password"}<KeyboardInput required type="password" placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        {mode === "login" && <button className="forgot-password" type="button">{ar ? "نسيت كلمة المرور؟" : "Forgot password?"}</button>}
        <button className="primary-button full-button auth-submit" type="submit">{mode === "login" ? (ar ? "تسجيل الدخول" : "Log in") : (ar ? "إنشاء حساب" : "Create account")}</button>
      </form>
      <p className="auth-switch-copy">{mode === "login" ? (ar ? "ليس لديك حساب؟" : "New to Doctor Plus?") : (ar ? "لديك حساب بالفعل؟" : "Already have an account?")} <button onClick={() => { keyboard.hide(); setMode(mode === "login" ? "signup" : "login"); }}>{mode === "login" ? (ar ? "إنشاء حساب" : "Sign up") : (ar ? "تسجيل الدخول" : "Log in")}</button></p>
      <p className="auth-privacy"><CheckIcon width="13" height="13" />{t.accountSafety}</p>
    </>}
  </section>;
}

function ScreenTitle({ title, onBack, rtl }: { title: string; onBack: () => void; rtl: boolean }) {
  return <div className="screen-title"><button className="back-button" data-back-direction={rtl ? "rtl" : "ltr"} onClick={onBack} aria-label={rtl ? "رجوع" : "Back"}>{rtl ? <ChevronRightIcon width="19" height="19" /> : <ChevronLeftIcon width="19" height="19" />}</button><h1>{title}</h1><span /></div>;
}

function DoctorAvatar({ doctor }: { doctor: (typeof doctors)[number] }) {
  return <span className={`doctor-avatar avatar-${doctor.tone}`}><img src={doctor.photo} alt={doctor.name} /></span>;
}

function DoctorCard({ doctor, lang, t, onBook, onOpen, onMessage, onFavorite, isFavorite }: { doctor: (typeof doctors)[number]; lang: Lang; t: any; onBook: () => void; onOpen: () => void; onMessage: () => void; onFavorite: () => void; isFavorite: boolean }) {
  return <article className="doctor-card"><button className="doctor-card-open" onClick={onOpen}><DoctorAvatar doctor={doctor} /><span className="doctor-card-copy"><strong>{doctorDisplayName(doctor, lang)}</strong><small>{doctor.title[lang]}</small><span className="doctor-rating"><StarFilledIcon width="12" height="12" /> {doctor.rating} <i>·</i> {doctor.reviews} {t.reviews}</span></span></button><div className="doctor-card-actions"><button className={`favorite-mini ${isFavorite ? "selected" : ""}`} onClick={onFavorite} aria-label={isFavorite ? t.removeFavorite : t.favorite} aria-pressed={isFavorite} title={isFavorite ? t.removeFavorite : t.favorite}>{isFavorite ? <HeartFilledIcon width="17" height="17" /> : <HeartIcon width="17" height="17" />}</button><button className="message-mini" onClick={onMessage} aria-label={t.messageDoctor} title={t.messageDoctor}><ChatBubbleIcon width="17" height="17" /></button><button className="book-mini" onClick={onBook}>{t.book}</button></div></article>;
}

function doctorDisplayName(doctor: (typeof doctors)[number], lang: Lang) {
  return lang === "ar" ? doctor.nameAr : doctor.name;
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

function specialtyLabel(name: string, lang: Lang) {
  if (lang === "en") return name;
  return ({ Cardiology: "طب القلب", Dentistry: "طب الأسنان", Pediatrics: "طب الأطفال", Ophthalmology: "طب العيون", Dermatology: "الأمراض الجلدية", Orthopedics: "جراحة العظام", Gynecology: "طب النساء", Neurology: "طب الأعصاب" } as Record<string, string>)[name] || name;
}

function getServiceOptions(label: string, lang: Lang, t: any, serviceList: readonly string[]): string[] {
  const healthRecordAliases: Record<string, string> = lang === "ar"
    ? { "نتائج التحاليل": t.services[3], "السجلات الطبية": additionalServices.ar[10] }
    : { "Lab results": t.services[3], "Medical records": additionalServices.en[10] };
  const index = serviceList.indexOf(healthRecordAliases[label] || label);
  const options = lang === "ar"
    ? [
      ["ابحث عن طبيب", "احجز كشفاً في العيادة", "استشارة فيديو"],
      ["استشارة فيديو", "اختيار طبيب", "إرفاق ملف طبي"],
      ["ابحث عن دواء", "رفع وصفة طبية", "طلب توصيل صيدلية"],
      ["احجز تحليلاً", "استعرض التحاليل", "رفع طلب طبي"],
      ["طلب ممرض منزلي", "حجز زيارة طبيب", "متابعة منزلية"],
      ["مراكز الرعاية العاجلة", "التواصل مع عيادة", "معلومات الطوارئ المحلية"],
      ["تفاصيل وثيقة التأمين", "العيادات المغطاة", "مطالباتي التأمينية"],
      ["جدول التطعيمات", "تطعيمات الأطفال", "احجز في مركز صحي"],
      ["العلاج الطبيعي", "احجز جلسة", "متابعة خطة العلاج"],
      ["استشارة اختصاصي تغذية", "خطط التغذية", "متابعة الوزن"],
      ["استشارة نفسية", "جلسة أونلاين", "موارد للدعم"],
      ["رعاية الحمل", "طبيب أطفال", "نمو الطفل وتغذيته"],
      ["المواعيد القادمة والسابقة", "تفاصيل آخر زيارة", "تقييم زيارة صحية"],
      ["قائمة التشخيصات", "تفاصيل التشخيص", "مشاركة التشخيص مع الطبيب"],
      ["عرض الصور الشعاعية", "تقارير التصوير", "مشاركة الصور مع الطبيب"],
      ["تقارير الأدوية والإجازات", "فتح تقرير طبي", "مشاركة التقرير"],
      ["عرض الوصفات الحالية", "سجل الأدوية السابق", "تذكير بجرعة"],
      ["إضافة تذكير دواء", "عرض التذكيرات", "إدارة جدول الجرعات"],
      ["إضافة ضغط الدم", "إضافة سكر الدم", "إضافة النبض أو الوزن"],
      ["عرض جدول اللقاحات", "تسجيل لقاح", "تنبيه بموعد اللقاح"],
      ["عرض حساسية الأدوية", "إضافة حساسية", "تعديل معلومات الحساسية"],
      ["عرض ملاحظات الطوارئ", "إضافة ملاحظة مهمة", "تعديل معلومات الطوارئ"],
      ["رفع مستند أو صورة طبية", "عرض المستندات", "إدارة الملفات الطبية"],
      ["اختيار معلومات للمشاركة", "تحديد مدة الوصول", "إلغاء مشاركة سابقة"],
      ["عرض آخر مرات الدخول", "تفاصيل نشاط الحساب", "تنبيه عن وصول غير معروف"],
      ["معلومات التبرع بالأعضاء", "إدارة تفضيلات التبرع", "مصادر رسمية في تركيا"],
      ["مواعيد فرق التبرع بالدم", "تسجيل رغبة بالتبرع", "سجل التبرع"],
      ["معلومات التبرع بنخاع العظم", "التسجيل كمتبرع", "متابعة الطلب"],
      ["ربط جهاز صحي", "مزامنة بيانات الخطوات والنبض", "إدارة الأجهزة المرتبطة"],
      ["اسأل عن طريقة استخدام التطبيق", "استكشف خدماتك الصحية", "معلومات صحية عامة"],
      ["تقييم زيارة صحية", "إرسال ملاحظات", "عرض تقييماتي السابقة"],
      ["عرض الوصفات البصرية", "تفاصيل وصفة النظارات", "إعادة حجز فحص نظر"],
      ["ملف أفراد العائلة", "إضافة تابع", "تحديد صلاحيات مشاركة السجل"],
    ]
    : [
      ["Find a doctor", "Book an in-clinic visit", "Video consultation"],
      ["Video consultation", "Choose a doctor", "Attach health records"],
      ["Find a medicine", "Upload a prescription", "Request pharmacy delivery"],
      ["Book a lab test", "Browse lab tests", "Upload a referral"],
      ["Request a home nurse", "Book a home doctor visit", "Home follow-up"],
      ["Nearby urgent care centers", "Contact a clinic", "Local emergency information"],
      ["Policy details", "Covered clinics", "Insurance claims"],
      ["Vaccination schedule", "Child vaccinations", "Book at a health center"],
      ["Physiotherapy", "Book a session", "Track a care plan"],
      ["Nutrition consultation", "Nutrition plans", "Weight check-in"],
      ["Mental health consult", "Online session", "Support resources"],
      ["Pregnancy care", "Pediatrician", "Child growth and nutrition"],
      ["Upcoming and past appointments", "Recent visit details", "Rate a care visit"],
      ["Diagnosis list", "Diagnosis details", "Share a diagnosis with a doctor"],
      ["View radiology images", "Imaging reports", "Share images with a doctor"],
      ["Medication and leave reports", "Open a medical report", "Share a report"],
      ["Current prescriptions", "Medication history", "Set a dose reminder"],
      ["Add a medication reminder", "View reminders", "Manage dose schedule"],
      ["Add blood pressure", "Add blood sugar", "Add pulse or weight"],
      ["View vaccination schedule", "Record a vaccine", "Vaccine appointment reminder"],
      ["View medication allergies", "Add an allergy", "Edit allergy information"],
      ["View emergency notes", "Add an important note", "Edit emergency information"],
      ["Upload a medical document or photo", "View documents", "Manage health files"],
      ["Choose information to share", "Set access duration", "Revoke a previous share"],
      ["View recent sign-ins", "Account activity details", "Flag unknown access"],
      ["Organ donation information", "Manage donation preference", "Official Turkish resources"],
      ["Blood donation team schedule", "Register donation interest", "Donation history"],
      ["Bone marrow donation information", "Register as a donor", "Track a request"],
      ["Connect a health device", "Sync steps and pulse", "Manage connected devices"],
      ["Learn how to use the app", "Explore health services", "General health information"],
      ["Rate a care visit", "Send feedback", "View previous ratings"],
      ["View optical prescriptions", "Glasses prescription details", "Book an eye exam"],
      ["Family member profiles", "Add a dependent", "Set record-sharing permissions"],
    ];
  return options[index] || [];
}

function HealthIconByIndex({ index }: { index: number }) {
  if (index === 0) return <PlusIcon width="17" height="17" />;
  if (index === 1) return <CheckIcon width="17" height="17" />;
  if (index === 2) return <CalendarIcon width="17" height="17" />;
  return <HeartIcon width="17" height="17" />;
}

function HealthPulseIcon() {
  return <svg className="health-pulse-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.1 8.8c0 5.2-8.1 10.7-8.1 10.7S3.9 14 3.9 8.8A4.4 4.4 0 0 1 12 6.1a4.4 4.4 0 0 1 8.1 2.7Z" /><path d="M5.8 12h2.5l1.4-2.2 1.9 4.4 1.5-2.3h4.9" /></svg>;
}
