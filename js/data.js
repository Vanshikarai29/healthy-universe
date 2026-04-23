/* ============================================
   HEALTHY UNIVERSE - DATA
   js/data.js
   ============================================ */

const POSTS = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    role: "Cardiologist",
    time: "2h ago",
    avatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop&crop=face",
    title: "5 Science-Backed Ways to Lower Your Blood Pressure Naturally 🫀",
    text: "As a cardiologist, I often get asked about natural ways to manage blood pressure. Here are my top evidence-based recommendations that can make a real difference...",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=500&fit=crop",
    trusted: true,
    likes: 1243,
    comments: 89,
    shares: 156,
    tags: ["#Cardiology", "#Heart Health", "#Prevention"],
    views: "12.5K",
    liked: true,
    saved: false,
    earnings: 3.2,
  },
  {
    id: 2,
    name: "Maria Santos",
    role: "Certified Nutritionist",
    time: "4h ago",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    title: "The Perfect Anti-Inflammatory Breakfast Bowl 🥗",
    text: "Start your day right with this nutrient-dense recipe packed with omega-3s, antioxidants, and fiber. Your gut will thank you!",
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=900&h=500&fit=crop",
    trusted: true,
    likes: 987,
    comments: 64,
    shares: 203,
    tags: ["#Nutrition", "#AntiInflammatory", "#GutHealth"],
    views: "9.1K",
    liked: false,
    saved: true,
    earnings: 1.8,
  },
  {
    id: 3,
    name: "James Cooper",
    role: "Personal Trainer & Coach",
    time: "6h ago",
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&h=100&fit=crop&crop=face",
    title: "30-Day Mobility Challenge! 🤸",
    text: "Want to improve your flexibility and reduce pain? Join me for this transformative challenge. Daily 10-minute routines that fit into any schedule.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&h=500&fit=crop",
    trusted: false,
    likes: 856,
    comments: 67,
    shares: 92,
    tags: ["#Fitness", "#Mobility", "#Challenge"],
    views: "9.2K",
    liked: false,
    saved: false,
    earnings: 0.95,
  },
  {
    id: 4,
    name: "Dr. Michael Chen",
    role: "Psychiatrist",
    time: "1d ago",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    title: "Breaking the Stigma: Why Therapy is for Everyone 🧠",
    text: "Mental health care shouldn't be a luxury or something to be ashamed of. In this post I share my journey and why every person deserves support and understanding.",
    image:
      "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=900&h=500&fit=crop",
    trusted: true,
    likes: 3412,
    comments: 245,
    shares: 890,
    tags: ["#MentalHealth", "#Psychiatry", "#Wellness"],
    views: "41K",
    liked: false,
    saved: false,
    earnings: 12.6,
  },
];

const NOTIFICATIONS = [
  {
    id: 1,
    avatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=80&h=80&fit=crop&crop=face",
    name: "Dr. Sarah Mitchell",
    action: "liked your post",
    quote: '"The Perfect Anti-Inflammatory Breakfast Bowl"',
    time: "5m ago",
    iconType: "heart",
    unread: true,
  },
  {
    id: 2,
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=80&h=80&fit=crop&crop=face",
    name: "James Cooper",
    action: "commented on your post",
    quote: "Great advice! I've been recommending this to my clients.",
    time: "1h ago",
    iconType: "comment",
    unread: true,
  },
  {
    id: 3,
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face",
    name: "Dr. Michael Chen",
    action: "started following you",
    quote: null,
    time: "3h ago",
    iconType: "follow",
    unread: false,
  },
  {
    id: 4,
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face",
    name: "Maria Santos",
    action: "liked your comment",
    quote: '"This is exactly what I needed to hear today!"',
    time: "5h ago",
    iconType: "heart",
    unread: false,
  },
  {
    id: 5,
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    name: "Dr. Emily Watson",
    action: "shared your post",
    quote: '"Understanding Anxiety: A Clinical Perspective"',
    time: "1d ago",
    iconType: "share",
    unread: false,
  },
];

const CREATORS = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Cardiologist",
    followers: "18.4K followers",
    avatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "Maria Santos",
    role: "Nutritionist",
    followers: "9.2K followers",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "James Cooper",
    role: "Personal Trainer",
    followers: "5.7K followers",
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&h=100&fit=crop&crop=face",
    verified: false,
  },
  {
    name: "Dr. Priya Nair",
    role: "Dermatologist",
    followers: "22.1K followers",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "Dr. Arjun Patel",
    role: "Orthopedic Surgeon",
    followers: "12.8K followers",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "Neha Gupta",
    role: "Yoga & Wellness Coach",
    followers: "3.9K followers",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    verified: false,
  },
];

const SUGGESTED_USERS = [
  {
    name: "Dr. Priya Nair",
    role: "Dermatologist",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "Maria Santos",
    role: "Nutritionist",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "James Cooper",
    role: "Personal Trainer",
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=80&h=80&fit=crop&crop=face",
    verified: false,
  },
];

const DOCTORS = [
  {
    id: "d1",
    name: "Dr. Sarah Mitchell",
    specialty: "Cardiologist",
    hospital: "Apollo Hospital, Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.9,
    reviews: 312,
    experience: 14,
    consultations: 2840,
    status: "online",
    price: 800,
    coins: 1600,
    tags: ["Heart Disease", "Hypertension", "ECG"],
    nextSlot: "Today, 3:00 PM",
  },
  {
    id: "d2",
    name: "Dr. Michael Chen",
    specialty: "Psychiatrist",
    hospital: "NIMHANS, Bangalore",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.8,
    reviews: 198,
    experience: 10,
    consultations: 1560,
    status: "busy",
    price: 600,
    coins: 1200,
    tags: ["Anxiety", "Depression", "CBT"],
    nextSlot: "Today, 5:00 PM",
  },
  {
    id: "d3",
    name: "Dr. Priya Nair",
    specialty: "Dermatologist",
    hospital: "Fortis Hospital, Delhi",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.9,
    reviews: 421,
    experience: 12,
    consultations: 3200,
    status: "online",
    price: 700,
    coins: 1400,
    tags: ["Acne", "Skin Allergy", "Hair Loss"],
    nextSlot: "Today, 2:30 PM",
  },
  {
    id: "d4",
    name: "Dr. Arjun Patel",
    specialty: "Orthopedic",
    hospital: "Medanta Hospital, Gurgaon",
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.7,
    reviews: 267,
    experience: 16,
    consultations: 2100,
    status: "online",
    price: 900,
    coins: 1800,
    tags: ["Knee Pain", "Spine", "Sports Injury"],
    nextSlot: "Tomorrow, 10:00 AM",
  },
  {
    id: "d5",
    name: "Maria Santos",
    specialty: "Nutritionist",
    hospital: "Online Practice",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.8,
    reviews: 184,
    experience: 7,
    consultations: 980,
    status: "online",
    price: 400,
    coins: 800,
    tags: ["Weight Loss", "Gut Health", "Diet Plans"],
    nextSlot: "Today, 1:00 PM",
  },
  {
    id: "d6",
    name: "Dr. Emily Watson",
    specialty: "Pediatrician",
    hospital: "Rainbow Children's Hospital",
    avatar:
      "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.9,
    reviews: 356,
    experience: 11,
    consultations: 2670,
    status: "online",
    price: 650,
    coins: 1300,
    tags: ["Child Health", "Vaccination", "Growth"],
    nextSlot: "Today, 4:30 PM",
  },
  {
    id: "d7",
    name: "Dr. James Okonkwo",
    specialty: "General Physician",
    hospital: "Practo Online Clinic",
    avatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.6,
    reviews: 512,
    experience: 9,
    consultations: 4200,
    status: "online",
    price: 350,
    coins: 700,
    tags: ["Fever", "Cold & Flu", "Diabetes"],
    nextSlot: "Available Now",
  },
  {
    id: "d8",
    name: "Dr. Neha Sharma",
    specialty: "Cardiologist",
    hospital: "Max Hospital, Chennai",
    avatar:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.8,
    reviews: 143,
    experience: 8,
    consultations: 890,
    status: "busy",
    price: 750,
    coins: 1500,
    tags: ["Cholesterol", "Heart Failure", "Pacemaker"],
    nextSlot: "Tomorrow, 9:00 AM",
  },
];

/* ============================================
   ✨ JOBS DATA
   ============================================ */
const JOBS = [
  {
    id: "j1",
    title: "Senior Cardiologist",
    company: "Apollo Hospitals",
    companyLogo:
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=80&h=80&fit=crop",
    location: "Mumbai, Maharashtra",
    type: "Full-Time",
    specialty: "Cardiology",
    salary: "₹18L – ₹28L/yr",
    experience: "5+ years",
    posted: "2 days ago",
    deadline: "Dec 30, 2025",
    applicants: 34,
    tags: ["MBBS", "MD Cardiology", "Echo"],
    description:
      "Apollo Hospitals is seeking an experienced Cardiologist to join our cardiac care team. You will perform diagnostic and interventional cardiology procedures, manage complex cardiac cases, and lead a team of junior doctors.",
    featured: true,
    saved: false,
    applied: false,
  },
  {
    id: "j2",
    title: "Psychiatry Resident (PGY-2)",
    company: "NIMHANS",
    companyLogo:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=80&h=80&fit=crop",
    location: "Bangalore, Karnataka",
    type: "Residency",
    specialty: "Psychiatry",
    salary: "₹75K – ₹90K/mo",
    experience: "1-2 years",
    posted: "1 day ago",
    deadline: "Jan 15, 2026",
    applicants: 89,
    tags: ["MBBS", "MD Psychiatry", "CBT"],
    description:
      "NIMHANS invites applications for PGY-2 Psychiatry Residency positions. Residents will rotate through inpatient, outpatient, and specialty clinics under senior supervision.",
    featured: false,
    saved: true,
    applied: false,
  },
  {
    id: "j3",
    title: "Clinical Nutritionist",
    company: "Max Healthcare",
    companyLogo:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=80&h=80&fit=crop",
    location: "Delhi NCR",
    type: "Full-Time",
    specialty: "Nutrition",
    salary: "₹6L – ₹10L/yr",
    experience: "2-4 years",
    posted: "3 days ago",
    deadline: "Jan 5, 2026",
    applicants: 52,
    tags: ["BSc Nutrition", "Clinical Diet", "Diabetes"],
    description:
      "Max Healthcare is looking for a Clinical Nutritionist to provide evidence-based dietary counselling for patients with chronic conditions including diabetes, obesity and renal disease.",
    featured: false,
    saved: false,
    applied: false,
  },
  {
    id: "j4",
    title: "Dermatology Internship",
    company: "Kaya Skin Clinic",
    companyLogo:
      "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=80&h=80&fit=crop",
    location: "Pune, Maharashtra",
    type: "Internship",
    specialty: "Dermatology",
    salary: "₹15K – ₹25K/mo",
    experience: "Fresher",
    posted: "Today",
    deadline: "Dec 20, 2025",
    applicants: 120,
    tags: ["MBBS Final Year", "Dermatology", "Cosmetic"],
    description:
      "Exciting 6-month internship opportunity at Kaya Skin Clinic. Interns will shadow senior dermatologists, assist in cosmetic procedures, and gain hands-on experience in laser treatments and skin diagnostics.",
    featured: true,
    saved: false,
    applied: false,
  },
  {
    id: "j5",
    title: "Orthopedic Surgeon",
    company: "Fortis Hospitals",
    companyLogo:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=80&h=80&fit=crop",
    location: "Chennai, Tamil Nadu",
    type: "Full-Time",
    specialty: "Orthopedics",
    salary: "₹20L – ₹35L/yr",
    experience: "7+ years",
    posted: "4 days ago",
    deadline: "Jan 20, 2026",
    applicants: 18,
    tags: ["MS Ortho", "Joint Replacement", "Spine Surgery"],
    description:
      "Fortis Hospitals Chennai is seeking a skilled Orthopedic Surgeon specializing in joint replacement and minimally invasive spine surgery. Lead a dynamic team and serve a high patient volume.",
    featured: false,
    saved: false,
    applied: false,
  },
  {
    id: "j6",
    title: "Pediatric Nurse Practitioner",
    company: "Rainbow Children's Hospital",
    companyLogo:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=80&h=80&fit=crop",
    location: "Hyderabad, Telangana",
    type: "Part-Time",
    specialty: "Pediatrics",
    salary: "₹4L – ₹6L/yr",
    experience: "1-3 years",
    posted: "5 days ago",
    deadline: "Dec 25, 2025",
    applicants: 67,
    tags: ["BSc Nursing", "Pediatrics", "NP Certified"],
    description:
      "Rainbow Children's Hospital is hiring part-time Pediatric Nurse Practitioners for weekend and evening shifts. Work closely with pediatricians in outpatient and inpatient settings.",
    featured: false,
    saved: true,
    applied: false,
  },
  {
    id: "j7",
    title: "Medical Content Writer",
    company: "Healthy Universe",
    companyLogo:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=80&h=80&fit=crop",
    location: "Remote",
    type: "Part-Time",
    specialty: "General Health",
    salary: "₹3L – ₹5L/yr",
    experience: "Fresher",
    posted: "Today",
    deadline: "Dec 31, 2025",
    applicants: 203,
    tags: ["MBBS", "Writing", "Healthcare"],
    description:
      "Healthy Universe is looking for medically qualified content writers to create evidence-based health articles, social media posts, and educational content for our platform. Work from anywhere.",
    featured: true,
    saved: false,
    applied: false,
  },
  {
    id: "j8",
    title: "General Physician – Teleconsult",
    company: "Practo",
    companyLogo:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=80&h=80&fit=crop",
    location: "Remote",
    type: "Full-Time",
    specialty: "General Physician",
    salary: "₹8L – ₹14L/yr",
    experience: "2+ years",
    posted: "2 days ago",
    deadline: "Jan 10, 2026",
    applicants: 145,
    tags: ["MBBS", "Teleconsultation", "General Medicine"],
    description:
      "Join Practo's growing network of online general physicians. Conduct video and chat consultations from the comfort of your home. Flexible hours, high patient volume, and instant payments.",
    featured: false,
    saved: false,
    applied: false,
  },
];

const MY_APPLICATIONS = [];


/* ============================================
   WALLET & TRANSACTIONS DATA
   ============================================ */
const TRANSACTIONS = [
  {
    id: "t1",
    type: "earning",
    title: "Post Revenue",
    description: "5 Science-Backed Ways to Lower Blood Pressure",
    amount: 3.20,
    currency: "USD",
    date: "2025-01-15",
    time: "2:34 PM",
    status: "completed",
    icon: "📝"
  },
  {
    id: "t2",
    type: "earning",
    title: "Video Views",
    description: "Heart Health Myths Debunked",
    amount: 1.85,
    currency: "USD",
    date: "2025-01-15",
    time: "11:20 AM",
    status: "completed",
    icon: "🎬"
  },
  {
    id: "t3",
    type: "withdrawal",
    title: "Bank Transfer",
    description: "HDFC Bank ****4521",
    amount: -50.00,
    currency: "USD",
    date: "2025-01-14",
    time: "4:15 PM",
    status: "completed",
    icon: "🏦"
  },
  {
    id: "t4",
    type: "coins",
    title: "HU Coins Earned",
    description: "Daily login bonus",
    amount: 50,
    currency: "coins",
    date: "2025-01-14",
    time: "9:00 AM",
    status: "completed",
    icon: "🪙"
  },
  {
    id: "t5",
    type: "spending",
    title: "Consultation Payment",
    description: "Dr. Sarah Mitchell - Cardiology",
    amount: -800,
    currency: "coins",
    date: "2025-01-13",
    time: "3:45 PM",
    status: "completed",
    icon: "👩‍⚕️"
  },
  {
    id: "t6",
    type: "earning",
    title: "Referral Bonus",
    description: "Dr. Priya Nair joined via your link",
    amount: 5.00,
    currency: "USD",
    date: "2025-01-13",
    time: "10:30 AM",
    status: "completed",
    icon: "🎁"
  },
  {
    id: "t7",
    type: "earning",
    title: "Post Revenue",
    description: "Mental Health: Breaking the Stigma",
    amount: 12.60,
    currency: "USD",
    date: "2025-01-12",
    time: "6:20 PM",
    status: "completed",
    icon: "📝"
  },
  {
    id: "t8",
    type: "coins",
    title: "HU Coins Earned",
    description: "Completed health quiz",
    amount: 100,
    currency: "coins",
    date: "2025-01-12",
    time: "2:00 PM",
    status: "completed",
    icon: "🎯"
  },
  {
    id: "t9",
    type: "withdrawal",
    title: "UPI Transfer",
    description: "michael@upi",
    amount: -25.00,
    currency: "USD",
    date: "2025-01-10",
    time: "5:30 PM",
    status: "completed",
    icon: "📱"
  },
  {
    id: "t10",
    type: "pending",
    title: "Pending Earnings",
    description: "Processing from 3 posts",
    amount: 8.45,
    currency: "USD",
    date: "2025-01-15",
    time: "Ongoing",
    status: "pending",
    icon: "⏳"
  }
];

const WALLET_STATS = {
  totalEarned: 1420.00,
  thisMonth: 124.50,
  lastMonth: 98.30,
  pendingPayout: 8.45,
  totalWithdrawn: 1295.50,
  huCoins: 2340,
  huCoinsValue: 234
};

const EARNING_SOURCES = [
  { label: "Post Revenue", amount: 856.20, percent: 60, color: "#1DB954" },
  { label: "Video Views", amount: 312.40, percent: 22, color: "#3b82f6" },
  { label: "Referrals", amount: 142.00, percent: 10, color: "#f59e0b" },
  { label: "Bonuses", amount: 109.40, percent: 8, color: "#8b5cf6" }
];
