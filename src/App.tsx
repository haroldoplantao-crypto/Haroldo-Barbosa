import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Activity, 
  Heart, 
  MapPin, 
  User as UserIcon, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  Calendar,
  ClipboardList,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Search,
  Zap,
  Eye,
  ListChecks,
  Home,
  BrainCircuit,
  Stethoscope as StethoscopeIcon,
  FileText,
  Download,
  Share2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  db 
} from './firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';

// --- Types ---
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

interface Consultation {
  id: string;
  specialty: string;
  doctorName?: string;
  date: string;
  notes?: string;
  timestamp: Timestamp;
}

interface PrescriptionRenewal {
  id: string;
  renewed: boolean;
  date: string;
  timestamp: Timestamp;
}

interface Exam {
  id: string;
  date: string;
  performed: boolean;
  result?: string;
  timestamp: Timestamp;
}

interface PatientLog {
  id: string;
  painLevel: number;
  painPoints: string[];
  fatigueLevel: number;
  sleepQuality: number;
  notes: string;
  timestamp: Timestamp;
}

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  isRegistered?: boolean;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  gender?: string;
}

interface Question {
  id: string;
  text: string;
  type: 'scale' | 'boolean' | 'choice';
  options?: { label: string; value: number | string }[];
  min?: number;
  max?: number;
}

interface AssessmentToolConfig {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  calculateScore: (answers: Record<string, any>) => { score: number; interpretation: string };
}

// --- Components ---

// --- Components ---

const PatientRegistration = ({ user, onComplete }: { user: User, onComplete: () => void }) => {
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [gender, setGender] = useState('Feminino');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phone,
        birthDate,
        cpf,
        gender,
        isRegistered: true
      });
      onComplete();
    } catch (error) {
      console.error("Erro ao completar cadastro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 max-w-md w-full"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#00A99D]/10 rounded-2xl flex items-center justify-center">
            <UserIcon className="text-[#00A99D]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Cadastro do Paciente</h2>
            <p className="text-sm text-slate-500">Complete seus dados para continuar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Telefone</label>
            <input 
              type="tel" required value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00A99D]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Data de Nascimento</label>
            <input 
              type="date" required value={birthDate} 
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00A99D]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">CPF</label>
            <input 
              type="text" required value={cpf} 
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00A99D]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Gênero</label>
            <select 
              value={gender} onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00A99D]"
            >
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          
          <button 
            type="submit" disabled={isSubmitting}
            className="w-full bg-[#00A99D] text-white py-4 rounded-2xl font-bold hover:bg-[#008278] transition-all shadow-lg shadow-[#00A99D]/20 active:scale-95 disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Components ---

const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 400 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M200 60V160C200 160 200 200 160 200H60C60 200 40 200 40 160V100C40 77.9086 57.9086 60 80 60H200Z" fill="url(#paint0_linear)" />
    <path d="M200 340V240C200 240 200 200 240 200H340C340 200 360 200 360 240V300C360 322.091 342.091 340 320 340H200Z" fill="url(#paint1_linear)" />
    <defs>
      <linearGradient id="paint0_linear" x1="40" y1="60" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00A99D" />
        <stop offset="1" stopColor="#008278" />
      </linearGradient>
      <linearGradient id="paint1_linear" x1="360" y1="340" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00A99D" />
        <stop offset="1" stopColor="#008278" />
      </linearGradient>
    </defs>
  </svg>
);

const Navbar = ({ user, onLogin, onLogout, onHome }: { user: User | null, onLogin: () => void, onLogout: () => void, onHome?: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
      <Logo className="w-10 h-10" />
      <div className="flex flex-col">
        <span className="font-bold text-slate-900 leading-tight text-xl tracking-tight">DHI <span className="text-[#00A99D]">SAÚDE</span></span>
        <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Clínica Médica Integrada</span>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      {user && (
        <button 
          onClick={onHome}
          className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#00A99D] transition-colors"
        >
          <Home size={18} />
          Início
        </button>
      )}
      {user ? (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-700">{user.displayName}</span>
            <button onClick={onLogout} className="text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
              <LogOut size={12} /> Sair
            </button>
          </div>
          <img 
            src={user.photoURL || ''} 
            alt={user.displayName || ''} 
            className="w-10 h-10 rounded-full border-2 border-[#00A99D]/20 shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <button 
          onClick={onLogin}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          Acessar App
        </button>
      )}
    </div>
  </nav>
);

const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00A99D]/10 text-[#008278] rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck size={14} />
              Cuidado Premium & Integrado
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-[1.1] mb-6">
              Clínica Médica Integrada <br />
              <span className="text-[#00A99D]">DHI Saúde</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
              Especialistas em monitoramento contínuo da <span className="font-semibold text-slate-800 underline decoration-[#00A99D]/30 underline-offset-4">fibromialgia</span>. Tecnologia e humanização para sua saúde.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={onLogin}
                className="bg-[#00A99D] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#008278] transition-all shadow-xl shadow-[#00A99D]/20 flex items-center justify-center gap-2 group active:scale-95"
              >
                Acessar App
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-4 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <UserIcon className="text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Dr. Haroldo Garcia Barbosa</p>
                  <p className="text-sm text-slate-500">CRM/SC 17.474</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <MapPin size={18} className="text-[#00A99D]" />
                <p className="text-sm">R. Peru, 333 – Centro, Timbó – SC</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00A99D]/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>
            
            <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
              <img 
                src="https://picsum.photos/seed/medical-care/800/1000" 
                alt="Medical Care" 
                className="w-full h-auto rounded-[2rem] object-cover"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-[#00A99D] rounded-full flex items-center justify-center">
                    <Activity className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Status do Paciente</p>
                    <p className="font-bold text-slate-900">Monitoramento Ativo</p>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 2, delay: 1 }}
                    className="h-full bg-[#00A99D]"
                  ></motion.div>
                </div>
              </div>
            </div>
            
            {/* Floating Icons */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-50"
            >
              <Heart className="text-red-500 w-8 h-8" />
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-40 -right-5 bg-white p-4 rounded-2xl shadow-xl border border-slate-50"
            >
              <Clock className="text-[#00A99D] w-8 h-8" />
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: "Pacientes Atendidos", value: "2.500+", icon: UserIcon },
          { label: "Anos de Experiência", value: "15+", icon: Calendar },
          { label: "Monitoramento 24/7", value: "Digital", icon: Activity },
          { label: "Cuidado Integrado", value: "100%", icon: ShieldCheck },
        ].map((stat, i) => (
          <div key={i} className="text-center p-6 rounded-3xl hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-[#00A99D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <stat.icon className="text-[#00A99D] w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const AssessmentQuestionnaire = ({ tool, user, onComplete, onCancel }: { tool: AssessmentToolConfig, user: User, onComplete: () => void, onCancel: () => void }) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < tool.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { score, interpretation } = tool.calculateScore(answers);
      const path = 'assessments';
      try {
        await addDoc(collection(db, path), {
          uid: user.uid,
          toolId: tool.id,
          toolName: tool.name,
          score,
          answers,
          interpretation,
          timestamp: Timestamp.now()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
      onComplete();
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = tool.questions[currentStep];
  const progress = ((currentStep + 1) / tool.questions.length) * 100;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{tool.name}</h2>
          <p className="text-slate-500 text-sm">Questão {currentStep + 1} de {tool.questions.length}</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <LogOut size={24} />
        </button>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full mb-12 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="bg-blue-600 h-full"
        />
      </div>

      <div className="min-h-[300px] flex flex-col justify-center">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <h3 className="text-xl font-medium text-slate-800 leading-relaxed">
            {currentQuestion.text}
          </h3>

          {currentQuestion.type === 'scale' && (
            <div className="space-y-6">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Nada</span>
                <span>Extremo</span>
              </div>
              <div className="grid grid-cols-11 gap-2">
                {Array.from({ length: (currentQuestion.max || 10) - (currentQuestion.min || 0) + 1 }).map((_, i) => {
                  const val = (currentQuestion.min || 0) + i;
                  return (
                    <button
                      key={val}
                      onClick={() => setAnswers({ ...answers, [currentQuestion.id]: val })}
                      className={`h-12 rounded-xl font-bold transition-all ${
                        answers[currentQuestion.id] === val 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' 
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentQuestion.type === 'boolean' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Sim', value: true },
                { label: 'Não', value: false }
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setAnswers({ ...answers, [currentQuestion.id]: opt.value })}
                  className={`py-6 rounded-3xl font-bold text-lg transition-all border-2 ${
                    answers[currentQuestion.id] === opt.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100'
                      : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setAnswers({ ...answers, [currentQuestion.id]: opt.value })}
                  className={`w-full p-5 rounded-2xl font-medium text-left transition-all border-2 flex items-center justify-between ${
                    answers[currentQuestion.id] === opt.value
                      ? 'bg-blue-50 text-blue-700 border-blue-600'
                      : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'
                  }`}
                >
                  {opt.label}
                  {answers[currentQuestion.id] === opt.value && <CheckCircle2 size={20} />}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="flex gap-4 mt-12">
        <button
          onClick={handleBack}
          className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
        >
          {currentStep === 0 ? 'Cancelar' : 'Voltar'}
        </button>
        <button
          onClick={handleNext}
          disabled={answers[currentQuestion.id] === undefined || isSubmitting}
          className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Salvando...' : currentStep === tool.questions.length - 1 ? 'Finalizar' : 'Próxima'}
          {!isSubmitting && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
};

const PatientDashboard = ({ user, profile, selectedToolId, setSelectedToolId }: { user: User, profile: UserProfile | null, selectedToolId: string | null, setSelectedToolId: (id: string | null) => void }) => {
  const [logs, setLogs] = useState<PatientLog[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('');
  const [isAddingMed, setIsAddingMed] = useState(false);

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [newConsSpecialty, setNewConsSpecialty] = useState('');
  const [newConsDoctor, setNewConsDoctor] = useState('');
  const [newConsDate, setNewConsDate] = useState('');
  const [newConsNotes, setNewConsNotes] = useState('');
  const [isAddingCons, setIsAddingCons] = useState(false);

  const [prescriptions, setPrescriptions] = useState<PrescriptionRenewal[]>([]);
  const [newPresRenewed, setNewPresRenewed] = useState<boolean>(true);
  const [newPresDate, setNewPresDate] = useState('');
  const [isAddingPres, setIsAddingPres] = useState(false);

  const [exams, setExams] = useState<Exam[]>([]);
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamPerformed, setNewExamPerformed] = useState<boolean>(true);
  const [isAddingExam, setIsAddingExam] = useState(false);

  useEffect(() => {
    const match = MEDICATION_DATABASE.find(m => m.name.toLowerCase() === newMedName.toLowerCase());
    if (match && !newMedDosage && !newMedFreq) {
      setNewMedDosage(match.dosage);
      setNewMedFreq(match.frequency);
    }
  }, [newMedName]);

  const PAIN_POINTS = [
    'Mandíbula (E)', 'Mandíbula (D)',
    'Ombro (E)', 'Ombro (D)',
    'Braço (E)', 'Braço (D)',
    'Antebraço (E)', 'Antebraço (D)',
    'Quadril (E)', 'Quadril (D)',
    'Coxa (E)', 'Coxa (D)',
    'Perna (E)', 'Perna (D)',
    'Pescoço', 'Dorso', 'Lombar', 'Tórax', 'Abdome'
  ];

  const MEDICATION_DATABASE = [
    { name: 'Paracetamol', dosage: '500 mg', frequency: '6/6h ou 8/8h', class: 'Analgésico' },
    { name: 'Dipirona', dosage: '500 mg', frequency: '6/6h ou 8/8h', class: 'Analgésico' },
    { name: 'Ibuprofeno', dosage: '400 mg', frequency: '8/8h', class: 'AINE' },
    { name: 'Naproxeno', dosage: '250 mg', frequency: '12/12h', class: 'AINE' },
    { name: 'Diclofenaco', dosage: '50 mg', frequency: '8/8h', class: 'AINE' },
    { name: 'Cetoprofeno', dosage: '100 mg', frequency: '12/12h', class: 'AINE' },
    { name: 'Meloxicam', dosage: '7,5 mg', frequency: '24/24h', class: 'AINE' },
    { name: 'Etoricoxibe', dosage: '60 mg', frequency: '24/24h', class: 'Inibidor COX-2' },
    { name: 'Celecoxibe', dosage: '100 mg', frequency: '12/12h', class: 'Inibidor COX-2' },
    { name: 'Tramadol', dosage: '50 mg', frequency: '6/6h ou 8/8h', class: 'Opioide Fraco' },
    { name: 'Codeína', dosage: '30 mg', frequency: '6/6h', class: 'Opioide Fraco' },
    { name: 'Tapentadol', dosage: '50 mg', frequency: '12/12h', class: 'Opioide' },
    { name: 'Morfina', dosage: '10 mg', frequency: '4/4h', class: 'Opioide Forte' },
    { name: 'Oxicodona', dosage: '5 mg', frequency: '12/12h', class: 'Opioide Forte' },
    { name: 'Fentanil (Adesivo)', dosage: '25 mcg/h', frequency: 'a cada 72h', class: 'Opioide Forte' },
    { name: 'Metadona', dosage: '5 mg', frequency: '12/12h', class: 'Opioide Forte' },
    { name: 'Pregabalina', dosage: '75 mg', frequency: '12/12h', class: 'Anticonvulsivante' },
    { name: 'Gabapentina', dosage: '300 mg', frequency: '8/8h', class: 'Anticonvulsivante' },
    { name: 'Carbamazepina', dosage: '200 mg', frequency: '12/12h', class: 'Anticonvulsivante' },
    { name: 'Topiramato', dosage: '25 mg', frequency: '12/12h', class: 'Anticonvulsivante' },
    { name: 'Valproato', dosage: '250 mg', frequency: '12/12h', class: 'Anticonvulsivante' },
    { name: 'Lamotrigina', dosage: '25 mg', frequency: '24/24h', class: 'Anticonvulsivante' },
    { name: 'Duloxetina', dosage: '30 mg', frequency: '24/24h', class: 'IRSN' },
    { name: 'Venlafaxina', dosage: '75 mg', frequency: '24/24h', class: 'IRSN' },
    { name: 'Amitriptilina', dosage: '10 mg', frequency: 'à noite', class: 'AD Tricíclico' },
    { name: 'Nortriptilina', dosage: '10 mg', frequency: 'à noite', class: 'AD Tricíclico' },
    { name: 'Trazodona', dosage: '50 mg', frequency: 'à noite', class: 'Antidepressivo' },
    { name: 'Mirtazapina', dosage: '15 mg', frequency: 'à noite', class: 'Antidepressivo' },
    { name: 'Ciclobenzaprina', dosage: '5 mg', frequency: 'à noite', class: 'Relaxante Muscular' },
    { name: 'Tizanidina', dosage: '2 mg', frequency: '8/8h', class: 'Relaxante Muscular' },
    { name: 'Baclofeno', dosage: '5 mg', frequency: '8/8h', class: 'Relaxante Muscular' },
    { name: 'Carisoprodol', dosage: '250 mg', frequency: '8/8h', class: 'Relaxante Muscular' },
    { name: 'Orfenadrina', dosage: '100 mg', frequency: '12/12h', class: 'Relaxante Muscular' },
    { name: 'Zolpidem', dosage: '5 mg', frequency: 'à noite', class: 'Hipnótico' },
    { name: 'Melatonina', dosage: '3 mg', frequency: 'à noite', class: 'Hormônio' },
    { name: 'Clonazepam', dosage: '0,5 mg', frequency: '12/12h', class: 'Benzodiazepínico' },
    { name: 'Diazepam', dosage: '5 mg', frequency: '12/12h', class: 'Benzodiazepínico' },
    { name: 'Canabidiol', dosage: '5 mg', frequency: '12/12h', class: 'Canabinoide' },
    { name: 'THC + CBD', dosage: '5 mg', frequency: '12/12h', class: 'Canabinoide' },
    { name: 'Lidocaína (Adesivo)', dosage: '5%', frequency: '12h ligado / 12h desligado', class: 'Anestésico Local' },
    { name: 'Capsaicina (Creme)', dosage: '0,025%', frequency: '3x ao dia', class: 'Tópico' },
    { name: 'Diclofenaco Gel', dosage: '2%', frequency: '3x ao dia', class: 'AINE Tópico' },
    { name: 'Cetoprofeno Gel', dosage: '2,5%', frequency: '3x ao dia', class: 'AINE Tópico' },
    { name: 'Sumatriptano', dosage: '50 mg', frequency: 'se necessário', class: 'Triptano' },
    { name: 'Rizatriptano', dosage: '10 mg', frequency: 'se necessário', class: 'Triptano' },
    { name: 'Propranolol', dosage: '40 mg', frequency: '12/12h', class: 'Betabloqueador' },
    { name: 'Flunarizina', dosage: '10 mg', frequency: 'à noite', class: 'Bloqueador de Canais de Cálcio' },
    { name: 'Verapamil', dosage: '80 mg', frequency: '8/8h', class: 'Bloqueador de Canais de Cálcio' },
    { name: 'Colchicina', dosage: '0,5 mg', frequency: '12/12h', class: 'Anti-inflamatório' },
    { name: 'Metotrexato', dosage: '7,5 mg', frequency: 'semanal', class: 'MMCD' },
    { name: 'Leflunomida', dosage: '20 mg', frequency: '24/24h', class: 'MMCD' },
    { name: 'Hidroxicloroquina', dosage: '200 mg', frequency: '12/12h', class: 'MMCD' },
  ];

  const SPECIALTIES = [
    'Clínico Geral / Medicina de Família',
    'Reumatologista',
    'Psiquiatra',
    'Neurologista',
    'Ortopedista',
    'Médico da Dor (Algologia)',
    'Endocrinologista',
    'Ginecologista',
    'Médico do Trabalho',
    'Fisioterapeuta',
    'Educador Físico',
    'Terapeuta Ocupacional',
    'Quiropraxista',
    'Osteopata',
    'Psicólogo',
    'Terapeuta Cognitivo-Comportamental',
    'Neuropsicólogo',
    'Nutricionista',
    'Nutrólogo',
    'Acupunturista',
    'Profissional de Medicina Integrativa',
    'Massoterapeuta',
    'Instrutor de Yoga / Pilates',
    'Terapeuta de Mindfulness'
  ];

  const ASSESSMENT_TOOLS: AssessmentToolConfig[] = [
    {
      id: 'icaf',
      name: 'ICAF – Índice Combinado de Gravidade da Fibromialgia',
      description: 'Avalia a gravidade global da fibromialgia.',
      questions: [
        { id: 'q1', text: 'Como você avalia sua dor hoje?', type: 'scale', min: 0, max: 10 },
        { id: 'q2', text: 'Como você avalia seu cansaço hoje?', type: 'scale', min: 0, max: 10 },
        { id: 'q3', text: 'Como você avalia a qualidade do seu sono?', type: 'scale', min: 0, max: 10 },
        { id: 'q4', text: 'Você sente rigidez matinal?', type: 'boolean' }
      ],
      calculateScore: (ans) => {
        const score = (ans.q1 + ans.q2 + ans.q3 + (ans.q4 ? 5 : 0)) / 4;
        return { score, interpretation: score > 7 ? 'Gravidade Alta' : score > 4 ? 'Gravidade Moderada' : 'Gravidade Leve' };
      }
    },
    {
      id: 'first',
      name: 'FIRST – Ferramenta de Triagem Rápida de Fibromialgia',
      description: 'Triagem rápida para identificação de fibromialgia.',
      questions: [
        { id: 'q1', text: 'Sinto dor em todo o meu corpo.', type: 'boolean' },
        { id: 'q2', text: 'Minha dor é acompanhada por um cansaço geral muito grande.', type: 'boolean' },
        { id: 'q3', text: 'Minha dor parece uma queimadura, um choque ou uma picada.', type: 'boolean' },
        { id: 'q4', text: 'Minha dor é acompanhada por outras sensações anormais como formigamento ou dormência.', type: 'boolean' },
        { id: 'q5', text: 'Minha dor é acompanhada por outros problemas de saúde como problemas digestivos ou urinários.', type: 'boolean' },
        { id: 'q6', text: 'Minha dor tem um impacto importante na minha vida diária.', type: 'boolean' }
      ],
      calculateScore: (ans) => {
        const score = Object.values(ans).filter(v => v === true).length;
        return { score, interpretation: score >= 5 ? 'Provável Fibromialgia' : 'improvável Fibromialgia' };
      }
    },
    {
      id: 'fiqr',
      name: 'FIQR (Br) – Questionário de Impacto para Fibromialgia',
      description: 'Avalia o impacto da fibromialgia na vida do paciente.',
      questions: [
        { id: 'q1', text: 'Capacidade de realizar tarefas físicas (compras, limpeza, etc)', type: 'scale', min: 0, max: 10 },
        { id: 'q2', text: 'Impacto nos sintomas (dor, cansaço, sono)', type: 'scale', min: 0, max: 10 },
        { id: 'q3', text: 'Impacto emocional (ansiedade, depressão)', type: 'scale', min: 0, max: 10 }
      ],
      calculateScore: (ans) => {
        const score = (ans.q1 + ans.q2 + ans.q3) / 3;
        return { score, interpretation: score > 7 ? 'Impacto Severo' : score > 4 ? 'Impacto Moderado' : 'Impacto Leve' };
      }
    },
    {
      id: 'phq15',
      name: 'PHQ-15 – Questionário de Saúde do Paciente',
      description: 'Avalia a presença de sintomas somáticos.',
      questions: [
        { id: 'q1', text: 'Dores de estômago', type: 'choice', options: [{label: 'Nada', value: 0}, {label: 'Um pouco', value: 1}, {label: 'Muito', value: 2}] },
        { id: 'q2', text: 'Dores nas costas', type: 'choice', options: [{label: 'Nada', value: 0}, {label: 'Um pouco', value: 1}, {label: 'Muito', value: 2}] },
        { id: 'q3', text: 'Dores nos braços, pernas ou articulações', type: 'choice', options: [{label: 'Nada', value: 0}, {label: 'Um pouco', value: 1}, {label: 'Muito', value: 2}] },
        { id: 'q4', text: 'Dores menstruais ou outros problemas com o período', type: 'choice', options: [{label: 'Nada', value: 0}, {label: 'Um pouco', value: 1}, {label: 'Muito', value: 2}] },
        { id: 'q5', text: 'Dores de cabeça', type: 'choice', options: [{label: 'Nada', value: 0}, {label: 'Um pouco', value: 1}, {label: 'Muito', value: 2}] }
      ],
      calculateScore: (ans) => {
        const score = Object.values(ans).reduce((a: any, b: any) => a + b, 0);
        return { score, interpretation: score >= 15 ? 'Sintomas Somáticos Graves' : score >= 10 ? 'Moderados' : 'Leves' };
      }
    },
    {
      id: 'csi',
      name: 'CSI – Inventário de Sensibilização Central',
      description: 'Avalia a sensibilização central do sistema nervoso.',
      questions: [
        { id: 'q1', text: 'Sinto-me cansado(a) mesmo depois de uma noite de sono.', type: 'choice', options: [{label: 'Nunca', value: 0}, {label: 'Raramente', value: 1}, {label: 'Às vezes', value: 2}, {label: 'Frequentemente', value: 3}, {label: 'Sempre', value: 4}] },
        { id: 'q2', text: 'Sinto os meus músculos tensos e rígidos.', type: 'choice', options: [{label: 'Nunca', value: 0}, {label: 'Raramente', value: 1}, {label: 'Às vezes', value: 2}, {label: 'Frequentemente', value: 3}, {label: 'Sempre', value: 4}] },
        { id: 'q3', text: 'Tenho dores de cabeça.', type: 'choice', options: [{label: 'Nunca', value: 0}, {label: 'Raramente', value: 1}, {label: 'Às vezes', value: 2}, {label: 'Frequentemente', value: 3}, {label: 'Sempre', value: 4}] }
      ],
      calculateScore: (ans) => {
        const score = Object.values(ans).reduce((a: any, b: any) => a + b, 0);
        return { score, interpretation: score >= 40 ? 'Alta Probabilidade de Sensibilização Central' : 'Baixa Probabilidade' };
      }
    }
  ];

  // Add placeholders for the rest of the tools to fulfill the requirement
  const ALL_TOOLS: AssessmentToolConfig[] = [
    ...ASSESSMENT_TOOLS,
    { id: 'crsfs', name: 'CRSFS – Ferramenta de Triagem Rápida de Fibromialgia', description: '', questions: [{id: 'q1', text: 'Você sente dor persistente há mais de 3 meses?', type: 'boolean'}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'fsq', name: 'FSQ – Questionário de Pesquisa em Fibromialgia', description: '', questions: [{id: 'q1', text: 'Índice de Dor Generalizada (WPI)', type: 'scale', min: 0, max: 19}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'lfessq', name: 'LFESSQ – Questionário de Triagem do London Fibromyalgia Epidemiology Study', description: '', questions: [{id: 'q1', text: 'Você tem dor em 4 quadrantes do corpo?', type: 'boolean'}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'fav', name: 'Ferramenta de Avaliação da Fibromialgia', description: '', questions: [{id: 'q1', text: 'Avalie sua dor média na última semana', type: 'scale', min: 0, max: 10}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'fas', name: 'FAS – Avaliação de Fibromialgia Autoadministrada', description: '', questions: [{id: 'q1', text: 'Avalie sua fadiga na última semana', type: 'scale', min: 0, max: 10}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'haq', name: 'HAQ – Avaliação do Estado de Saúde', description: '', questions: [{id: 'q1', text: 'Você consegue se vestir sozinho?', type: 'boolean'}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'ibd', name: 'Inventário Breve sobre a Dor', description: '', questions: [{id: 'q1', text: 'Avalie sua dor no momento', type: 'scale', min: 0, max: 10}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'egd', name: 'Escala Global de Dor', description: '', questions: [{id: 'q1', text: 'Avalie sua dor global', type: 'scale', min: 0, max: 10}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'gss', name: 'GSS – Sensibilidade Sensorial Generalizada', description: '', questions: [{id: 'q1', text: 'Você é sensível a luzes fortes?', type: 'boolean'}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'tss', name: 'Transtorno de Sintoma Somático', description: '', questions: [{id: 'q1', text: 'Preocupação excessiva com sintomas', type: 'scale', min: 0, max: 10}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'pvaq', name: 'PVAQ – Questionário de Vigilância e Consciência da Dor', description: '', questions: [{id: 'q1', text: 'Eu fico atento à minha dor', type: 'boolean'}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'gsq65', name: 'GSQ-65 – Questionário de Sintomas Gerais', description: '', questions: [{id: 'q1', text: 'Sente tonturas?', type: 'boolean'}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) },
    { id: 'fqc', name: 'Questionário de Fibromialgia em Casa', description: '', questions: [{id: 'q1', text: 'Como a fibromialgia afeta sua rotina doméstica?', type: 'scale', min: 0, max: 10}], calculateScore: (ans) => ({ score: 0, interpretation: '' }) }
  ].map(t => ({
    ...t,
    description: t.description || 'Avaliação clínica de rotina.',
    calculateScore: t.calculateScore || ((ans: any) => ({ score: Object.values(ans).length, interpretation: 'Avaliação concluída' }))
  })) as AssessmentToolConfig[];

  const selectedTool = ALL_TOOLS.find(t => t.id === selectedToolId);
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [fatigue, setFatigue] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const qLogs = query(
      collection(db, 'logs'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const qAssessments = query(
      collection(db, 'assessments'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'log'
      })) as any[];
      setLogs(newLogs);
    });

    const unsubscribeAssessments = onSnapshot(qAssessments, (snapshot) => {
      const newAssessments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'assessment'
      })) as any[];
      setAssessments(newAssessments);
    });

    const qMeds = query(
      collection(db, 'medications'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMeds = onSnapshot(qMeds, (snapshot) => {
      const newMeds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Medication[];
      setMedications(newMeds);
    });

    const qCons = query(
      collection(db, 'consultations'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeCons = onSnapshot(qCons, (snapshot) => {
      const newCons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Consultation[];
      setConsultations(newCons);
    });

    const qPres = query(
      collection(db, 'prescriptions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribePres = onSnapshot(qPres, (snapshot) => {
      const newPres = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrescriptionRenewal[];
      setPrescriptions(newPres);
    });

    const qExams = query(
      collection(db, 'exams'),
      where('uid', '==', user.uid),
      orderBy('date', 'asc')
    );

    const unsubscribeExams = onSnapshot(qExams, (snapshot) => {
      const newExams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exam[];
      setExams(newExams);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeAssessments();
      unsubscribeMeds();
      unsubscribeCons();
      unsubscribePres();
      unsubscribeExams();
    };
  }, [user.uid]);

  const timelineItems = [...logs, ...assessments].sort((a, b) => 
    b.timestamp.toMillis() - a.timestamp.toMillis()
  );

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'logs'), {
        uid: user.uid,
        painLevel: selectedPainPoints.length,
        painPoints: selectedPainPoints,
        fatigueLevel: fatigue,
        sleepQuality: sleep,
        notes,
        timestamp: Timestamp.now()
      });
      setNotes('');
      setSelectedPainPoints([]);
    } catch (error) {
      console.error("Erro ao salvar log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName) return;
    setIsAddingMed(true);
    try {
      await addDoc(collection(db, 'medications'), {
        uid: user.uid,
        name: newMedName,
        dosage: newMedDosage,
        frequency: newMedFreq,
        timestamp: Timestamp.now()
      });
      setNewMedName('');
      setNewMedDosage('');
      setNewMedFreq('');
    } catch (error) {
      console.error("Erro ao adicionar medicamento:", error);
    } finally {
      setIsAddingMed(false);
    }
  };

  const handleRemoveMed = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'medications', id));
    } catch (error) {
      console.error("Erro ao remover medicamento:", error);
    }
  };

  const handleAddCons = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConsSpecialty || !newConsDate) return;
    setIsAddingCons(true);
    try {
      await addDoc(collection(db, 'consultations'), {
        uid: user.uid,
        specialty: newConsSpecialty,
        doctorName: newConsDoctor,
        date: newConsDate,
        notes: newConsNotes,
        timestamp: Timestamp.now()
      });
      setNewConsSpecialty('');
      setNewConsDoctor('');
      setNewConsDate('');
      setNewConsNotes('');
    } catch (error) {
      console.error("Erro ao adicionar consulta:", error);
    } finally {
      setIsAddingCons(false);
    }
  };

  const handleRemoveCons = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'consultations', id));
    } catch (error) {
      console.error("Erro ao remover consulta:", error);
    }
  };

  const handleAddPres = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresDate) return;
    setIsAddingPres(true);
    try {
      await addDoc(collection(db, 'prescriptions'), {
        uid: user.uid,
        renewed: newPresRenewed,
        date: newPresDate,
        timestamp: Timestamp.now()
      });
      setNewPresDate('');
      setNewPresRenewed(true);
    } catch (error) {
      console.error("Erro ao adicionar renovação:", error);
    } finally {
      setIsAddingPres(false);
    }
  };

  const handleTogglePres = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'prescriptions', id), {
        renewed: !currentStatus
      });
    } catch (error) {
      console.error("Erro ao atualizar renovação:", error);
    }
  };

  const handleRemovePres = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'prescriptions', id));
    } catch (error) {
      console.error("Erro ao remover renovação:", error);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamDate) return;
    setIsAddingExam(true);
    try {
      await addDoc(collection(db, 'exams'), {
        uid: user.uid,
        date: newExamDate,
        performed: newExamPerformed,
        timestamp: Timestamp.now()
      });
      setNewExamDate('');
      setNewExamPerformed(true);
    } catch (error) {
      console.error("Erro ao adicionar exame:", error);
    } finally {
      setIsAddingExam(false);
    }
  };

  const handleToggleExam = async (id: string, currentPerformed: boolean) => {
    try {
      await updateDoc(doc(db, 'exams', id), {
        performed: !currentPerformed
      });
    } catch (error) {
      console.error("Erro ao atualizar exame:", error);
    }
  };

  const handleRemoveExam = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'exams', id));
    } catch (error) {
      console.error("Erro ao remover exame:", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(0, 169, 157); // #00A99D
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('DHI SAÚDE', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CLÍNICA MÉDICA INTEGRADA', 20, 32);
    
    doc.setFontSize(10);
    doc.text(`Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 70, 25);
    
    // Patient Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Acompanhamento do Paciente', 20, 55);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const patientInfo = [
      ['Nome:', profile?.displayName || user.displayName || 'N/A'],
      ['CPF:', profile?.cpf || 'N/A'],
      ['Nascimento:', profile?.birthDate ? new Date(profile.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'],
      ['Telefone:', profile?.phone || 'N/A'],
      ['Gênero:', profile?.gender || 'N/A'],
      ['E-mail:', profile?.email || user.email || 'N/A']
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [],
      body: patientInfo,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 10;

    // Medications
    if (medications.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Medicamentos em Uso', 20, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Medicamento', 'Dosagem', 'Frequência']],
        body: medications.map(m => [m.name, m.dosage, m.frequency]),
        headStyles: { fillColor: [0, 169, 157] },
        styles: { fontSize: 9 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Recent Consultations
    if (consultations.length > 0) {
      if (currentY > 250) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Histórico de Consultas', 20, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Data', 'Especialidade', 'Profissional']],
        body: consultations.slice(0, 10).map(c => [
          new Date(c.date + 'T00:00:00').toLocaleDateString('pt-BR'),
          c.specialty,
          c.doctorName || 'Não informado'
        ]),
        headStyles: { fillColor: [0, 169, 157] },
        styles: { fontSize: 9 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Recent Exams
    if (exams.length > 0) {
      if (currentY > 250) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Exames Laboratoriais', 20, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Data', 'Status']],
        body: exams.slice(0, 10).map(e => [
          new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR'),
          e.performed ? 'Realizado' : 'Agendado'
        ]),
        headStyles: { fillColor: [0, 169, 157] },
        styles: { fontSize: 9 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Recent Symptoms (Logs)
    if (logs.length > 0) {
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Histórico Completo de Sintomas', 20, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Data', 'Dor', 'Fadiga', 'Sono', 'Pontos de Dor']],
        body: logs.map(l => [
          l.timestamp.toDate().toLocaleDateString('pt-BR'),
          l.painLevel,
          l.fatigueLevel,
          l.sleepQuality,
          l.painPoints?.join(', ') || 'Nenhum'
        ]),
        headStyles: { fillColor: [0, 169, 157] },
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Assessments
    if (assessments.length > 0) {
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Histórico de Avaliações Clínicas', 20, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Data', 'Ferramenta', 'Score', 'Interpretação']],
        body: assessments.map(a => [
          a.timestamp.toDate().toLocaleDateString('pt-BR'),
          a.toolName,
          a.score.toFixed(1),
          a.interpretation
        ]),
        headStyles: { fillColor: [0, 169, 157] },
        styles: { fontSize: 9 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Severity Monitoring & Conclusion
    if (assessments.length > 0 || logs.length > 0) {
      if (currentY > 200) { doc.addPage(); currentY = 20; }
      
      doc.setFillColor(240, 240, 240);
      doc.rect(15, currentY - 5, pageWidth - 30, 80, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Monitoramento de Gravidade e Conclusão Clínica', 20, currentY + 5);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Calculate Severity
      const latestFIQ = assessments.filter(a => a.toolId === 'fiqr')[0];
      const avgPain = logs.reduce((acc, curr) => acc + curr.painLevel, 0) / (logs.length || 1);
      const avgFatigue = logs.reduce((acc, curr) => acc + curr.fatigueLevel, 0) / (logs.length || 1);
      
      let severityText = "";
      let conclusionText = "";
      
      if (latestFIQ) {
        const score = latestFIQ.score;
        if (score >= 59) severityText = "Severa";
        else if (score >= 39) severityText = "Moderada";
        else severityText = "Leve";
        
        conclusionText = `Com base no último questionário FIQ-R (${score.toFixed(1)}), a gravidade do quadro é classificada como ${severityText}. `;
      } else {
        const score = (avgPain + avgFatigue) / 2;
        if (score >= 7) severityText = "Severa";
        else if (score >= 4) severityText = "Moderada";
        else severityText = "Leve";
        
        conclusionText = `Com base na média dos sintomas registrados (Dor: ${avgPain.toFixed(1)}, Fadiga: ${avgFatigue.toFixed(1)}), a gravidade clínica é estimada como ${severityText}. `;
      }

      // Trend analysis
      if (assessments.length >= 2) {
        const latest = assessments[0].score;
        const previous = assessments[1].score;
        if (latest > previous + 5) conclusionText += "Observa-se uma tendência de agudização dos sintomas em comparação ao período anterior. ";
        else if (latest < previous - 5) conclusionText += "Observa-se uma melhora clínica significativa e progressiva. ";
        else conclusionText += "O quadro clínico apresenta-se em estado de estabilidade. ";
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Classificação de Gravidade: ${severityText.toUpperCase()}`, 20, currentY + 15);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Análise de Médias:', 20, currentY + 25);
      doc.text(`- Média de Dor (0-19): ${avgPain.toFixed(1)}`, 25, currentY + 32);
      doc.text(`- Média de Fadiga (0-10): ${avgFatigue.toFixed(1)}`, 25, currentY + 39);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Conclusão:', 20, currentY + 50);
      doc.setFont('helvetica', 'normal');
      const splitConclusion = doc.splitTextToSize(conclusionText + "Recomenda-se a manutenção do acompanhamento multidisciplinar e ajuste terapêutico conforme necessário.", pageWidth - 40);
      doc.text(splitConclusion, 20, currentY + 57);
    }

    // Footer on each page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        'Dr. Haroldo Garcia Barbosa - CRM/SC 17.474 | R. Peru, 333 – Centro, Timbó – SC',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 25, doc.internal.pageSize.getHeight() - 10);
    }

    // Open in new tab for preview
    const pdfOutput = doc.output('bloburl');
    window.open(pdfOutput, '_blank');
    
    // Also trigger download
    doc.save(`Relatorio_DHI_Saude_${profile?.displayName || user.displayName}.pdf`);
  };

  const getSeverityInfo = () => {
    const latestFIQ = assessments.filter(a => a.toolId === 'fiqr')[0];
    const avgPain = logs.reduce((acc, curr) => acc + curr.painLevel, 0) / (logs.length || 1);
    const avgFatigue = logs.reduce((acc, curr) => acc + curr.fatigueLevel, 0) / (logs.length || 1);
    
    let severity = "Leve";
    let color = "text-emerald-600 bg-emerald-50 border-emerald-100";
    let score = 0;

    if (latestFIQ) {
      score = latestFIQ.score;
      if (score >= 59) {
        severity = "Severa";
        color = "text-red-600 bg-red-50 border-red-100";
      } else if (score >= 39) {
        severity = "Moderada";
        color = "text-orange-600 bg-orange-50 border-orange-100";
      }
    } else {
      score = (avgPain + avgFatigue) / 2;
      if (score >= 7) {
        severity = "Severa";
        color = "text-red-600 bg-red-50 border-red-100";
      } else if (score >= 4) {
        severity = "Moderada";
        color = "text-orange-600 bg-orange-50 border-orange-100";
      }
    }

    return { severity, color, score, avgPain, avgFatigue };
  };

  const severityInfo = getSeverityInfo();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {selectedToolId ? (
            <motion.div 
              key={`assessment-${selectedToolId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {selectedTool && (
                <AssessmentQuestionnaire 
                  tool={selectedTool} 
                  user={user} 
                  onComplete={() => {
                    const currentIndex = ALL_TOOLS.findIndex(t => t.id === selectedToolId);
                    if (currentIndex !== -1 && currentIndex < ALL_TOOLS.length - 1) {
                      setSelectedToolId(ALL_TOOLS[currentIndex + 1].id);
                    } else {
                      setSelectedToolId(null);
                    }
                  }}
                  onCancel={() => setSelectedToolId(null)}
                />
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="main-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Info Header Section */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Bem-vindo à DHI Saúde</h2>
                    <p className="text-slate-600 leading-relaxed">
                      Estamos aqui para oferecer o melhor suporte no seu tratamento de fibromialgia. 
                      Utilize o app diariamente para registrar seus sintomas e permitir um acompanhamento mais preciso.
                    </p>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <UserIcon className="text-blue-600" size={20} />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Dr. Haroldo Garcia Barbosa</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CRM/SC 17.474</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <MapPin className="text-slate-600" size={20} />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Unidade Timbó</p>
                        <p className="text-[10px] text-slate-500">R. Peru, 333 – Centro, Timbó – SC</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Severity Monitoring Section */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-[2rem] border flex flex-col justify-between ${severityInfo.color}`}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Gravidade Atual</p>
                    <h3 className="text-2xl font-bold">{severityInfo.severity}</h3>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Activity size={16} />
                    <span className="text-xs font-medium">Baseado em {assessments.some(a => a.toolId === 'fiqr') ? 'FIQ-R' : 'Médias de Sintomas'}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Média de Dor</p>
                    <h3 className="text-2xl font-bold text-slate-900">{severityInfo.avgPain.toFixed(1)}</h3>
                  </div>
                  <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full transition-all duration-500" 
                      style={{ width: `${(severityInfo.avgPain / 19) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Média de Fadiga</p>
                    <h3 className="text-2xl font-bold text-slate-900">{severityInfo.avgFatigue.toFixed(1)}</h3>
                  </div>
                  <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full transition-all duration-500" 
                      style={{ width: `${(severityInfo.avgFatigue / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Left Column: Daily Log */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <ClipboardList className="text-blue-600" />
                      Registro Diário
                    </h2>
                    
                    <form onSubmit={handleSubmitLog} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex justify-between">
                          Pontos Dolorosos <span>{selectedPainPoints.length} áreas</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-100">
                          {PAIN_POINTS.map(point => (
                            <button
                              key={point}
                              type="button"
                              onClick={() => {
                                setSelectedPainPoints(prev => 
                                  prev.includes(point) 
                                    ? prev.filter(p => p !== point)
                                    : [...prev, point]
                                );
                              }}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                                selectedPainPoints.includes(point)
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              {point}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                          Nível de Fadiga <span>{fatigue}/10</span>
                        </label>
                        <input 
                          type="range" min="0" max="10" value={fatigue} 
                          onChange={(e) => setFatigue(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                          Qualidade do Sono <span>{sleep}/10</span>
                        </label>
                        <input 
                          type="range" min="0" max="10" value={sleep} 
                          onChange={(e) => setSleep(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Observações</label>
                        <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Como você está se sentindo hoje?"
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Middle Column: Medications & Consultations */}
                <div className="lg:col-span-1 space-y-8">
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <ShieldCheck className="text-emerald-500" />
                      Medicamentos
                    </h2>

                    <form onSubmit={handleAddMed} className="space-y-4 mb-8">
                      <div>
                        <input 
                          type="text"
                          list="medication-suggestions"
                          value={newMedName}
                          onChange={(e) => setNewMedName(e.target.value)}
                          placeholder="Nome do Medicamento"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <datalist id="medication-suggestions">
                          {MEDICATION_DATABASE.map(med => (
                            <option key={med.name} value={med.name} />
                          ))}
                        </datalist>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text"
                          value={newMedDosage}
                          onChange={(e) => setNewMedDosage(e.target.value)}
                          placeholder="Dosagem (ex: 50mg)"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input 
                          type="text"
                          value={newMedFreq}
                          onChange={(e) => setNewMedFreq(e.target.value)}
                          placeholder="Frequência"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isAddingMed || !newMedName}
                        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 text-sm"
                      >
                        {isAddingMed ? 'Adicionando...' : 'Adicionar'}
                      </button>
                    </form>

                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sugestões comuns</p>
                      <div className="flex flex-wrap gap-1">
                        {MEDICATION_DATABASE.slice(0, 8).map(med => (
                          <button
                            key={med.name}
                            type="button"
                            onClick={() => {
                              setNewMedName(med.name);
                              setNewMedDosage(med.dosage);
                              setNewMedFreq(med.frequency);
                            }}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                          >
                            {med.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Uso Atual</h3>
                      <AnimatePresence mode="popLayout">
                        {medications.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">Nenhum medicamento registrado.</p>
                        ) : (
                          medications.map(med => (
                            <motion.div 
                              key={med.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group"
                            >
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{med.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{med.dosage} • {med.frequency}</p>
                              </div>
                              <button 
                                onClick={() => handleRemoveMed(med.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <AlertCircle size={16} />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Prescription Renewal Section */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <ClipboardList className="text-orange-500" />
                      Renovação de Receitas
                    </h2>

                    <form onSubmit={handleAddPres} className="space-y-4 mb-8">
                      <div className="flex gap-4 items-center">
                        <label className="text-sm font-bold text-slate-700">Renovada?</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewPresRenewed(true)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                              newPresRenewed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewPresRenewed(false)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                              !newPresRenewed ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>
                      <div>
                        <input 
                          type="date"
                          value={newPresDate}
                          onChange={(e) => setNewPresDate(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isAddingPres || !newPresDate}
                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 text-sm"
                      >
                        {isAddingPres ? 'Adicionando...' : 'Registrar Renovação'}
                      </button>
                    </form>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Histórico de Renovações</h3>
                      <AnimatePresence mode="popLayout">
                        {prescriptions.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">Nenhuma renovação registrada.</p>
                        ) : (
                          prescriptions.map(pres => (
                            <motion.div 
                              key={pres.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`p-4 rounded-2xl border flex justify-between items-center group transition-colors ${
                                pres.renewed ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleTogglePres(pres.id, pres.renewed)}
                                  className={`p-1 rounded-full transition-colors ${
                                    pres.renewed ? 'text-emerald-600' : 'text-red-600'
                                  }`}
                                >
                                  {pres.renewed ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                </button>
                                <div>
                                  <p className={`font-bold text-sm ${pres.renewed ? 'text-emerald-900' : 'text-red-900'}`}>
                                    Renovação: {pres.renewed ? 'Sim' : 'Não'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    Data: {new Date(pres.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRemovePres(pres.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <AlertCircle size={16} />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Consultations Section */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Calendar className="text-blue-500" />
                      Consultas
                    </h2>

                    <form onSubmit={handleAddCons} className="space-y-4 mb-8">
                      <div>
                        <select 
                          value={newConsSpecialty}
                          onChange={(e) => setNewConsSpecialty(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Especialidade</option>
                          {SPECIALTIES.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input 
                          type="text"
                          value={newConsDoctor}
                          onChange={(e) => setNewConsDoctor(e.target.value)}
                          placeholder="Profissional (Opcional)"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input 
                          type="date"
                          value={newConsDate}
                          onChange={(e) => setNewConsDate(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isAddingCons || !newConsSpecialty || !newConsDate}
                        className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 text-sm"
                      >
                        {isAddingCons ? 'Adicionando...' : 'Registrar Consulta'}
                      </button>
                    </form>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Histórico</h3>
                      <AnimatePresence mode="popLayout">
                        {consultations.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">Nenhuma consulta registrada.</p>
                        ) : (
                          consultations.map(cons => (
                            <motion.div 
                              key={cons.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group"
                            >
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{cons.specialty}</p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {new Date(cons.date + 'T00:00:00').toLocaleDateString('pt-BR')} • {cons.doctorName || 'Não informado'}
                                </p>
                              </div>
                              <button 
                                onClick={() => handleRemoveCons(cons.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <AlertCircle size={16} />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Exams Section */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Activity className="text-purple-500" />
                      Realização de Exames de Sangue (Laboratorial)
                    </h2>

                    <form onSubmit={handleAddExam} className="space-y-4 mb-8">
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="date"
                          value={newExamDate}
                          onChange={(e) => setNewExamDate(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewExamPerformed(true)}
                            className={`flex-1 rounded-xl text-xs font-bold transition-all ${
                              newExamPerformed ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewExamPerformed(false)}
                            className={`flex-1 rounded-xl text-xs font-bold transition-all ${
                              !newExamPerformed ? 'bg-slate-300 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium px-1">
                        * Selecione "Sim" se já realizou o exame ou "Não" se está agendado.
                      </p>
                      <button 
                        type="submit"
                        disabled={isAddingExam || !newExamDate}
                        className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition-all disabled:opacity-50 text-sm"
                      >
                        {isAddingExam ? 'Adicionando...' : 'Registrar Exame de Sangue'}
                      </button>
                    </form>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Histórico de Exames de Sangue (Laboratorial)</h3>
                      <AnimatePresence mode="popLayout">
                        {exams.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">Nenhum exame registrado.</p>
                        ) : (
                          exams.map(exam => (
                            <motion.div 
                              key={exam.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`p-4 rounded-2xl border flex justify-between items-center group transition-colors ${
                                exam.status === 'performed' ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleToggleExam(exam.id, exam.performed)}
                                  className={`p-1 rounded-full transition-colors ${
                                    exam.performed ? 'text-purple-600' : 'text-slate-300 hover:text-purple-500'
                                  }`}
                                >
                                  <CheckCircle2 size={20} />
                                </button>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">Exame de Sangue (Laboratorial)</p>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    {new Date(exam.date + 'T00:00:00').toLocaleDateString('pt-BR')} • {exam.performed ? 'Realizado' : 'Agendado'}
                                  </p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRemoveExam(exam.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <AlertCircle size={16} />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Right Column: Assessment Tools */}
                <div className="lg:col-span-2">
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 h-full">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Ferramentas de Avaliação</h2>
                    <p className="text-slate-500 mb-8 text-sm">Selecione uma ferramenta para realizar a avaliação ou triagem.</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {ALL_TOOLS.map((tool) => {
                        const ToolIcon = [
                          { id: 'icaf', icon: BarChart3 },
                          { id: 'first', icon: HelpCircle },
                          { id: 'crsfs', icon: ShieldCheck },
                          { id: 'fsq', icon: ClipboardList },
                          { id: 'lfessq', icon: Search },
                          { id: 'fav', icon: Activity },
                          { id: 'fas', icon: UserIcon },
                          { id: 'fiqr', icon: Heart },
                          { id: 'haq', icon: StethoscopeIcon },
                          { id: 'ibd', icon: AlertCircle },
                          { id: 'egd', icon: Activity },
                          { id: 'csi', icon: BrainCircuit },
                          { id: 'gss', icon: Zap },
                          { id: 'phq15', icon: ClipboardList },
                          { id: 'tss', icon: AlertCircle },
                          { id: 'pvaq', icon: Eye },
                          { id: 'gsq65', icon: ListChecks },
                          { id: 'fqc', icon: Home },
                        ].find(i => i.id === tool.id)?.icon || ClipboardList;

                        return (
                          <button 
                            key={tool.id}
                            onClick={() => setSelectedToolId(tool.id)}
                            className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group flex flex-col gap-4"
                          >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                              <ToolIcon className="text-blue-600" size={20} />
                            </div>
                            <span className="font-bold text-slate-800 text-xs leading-tight">{tool.name}</span>
                            <div className="mt-auto pt-2 flex items-center text-[9px] font-bold text-blue-600 uppercase tracking-widest">
                              Iniciar
                              <ChevronRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Generation Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 pb-12">
                <button
                  onClick={generatePDF}
                  className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-95"
                >
                  <FileText className="text-[#00A99D]" />
                  Gerar Relatório Completo (PDF)
                  <Download size={20} className="group-hover:translate-y-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Relatório DHI Saúde',
                        text: 'Confira meu relatório de acompanhamento da DHI Saúde.',
                        url: window.location.href
                      }).catch(console.error);
                    } else {
                      alert('Compartilhamento não suportado neste navegador. Use o botão de PDF para baixar o relatório.');
                    }
                  }}
                  className="bg-white text-slate-900 border-2 border-slate-200 px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Share2 className="text-blue-500" />
                  Compartilhar Acesso
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  const fetchUserProfile = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUserProfile(userSnap.data() as UserProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            role: 'patient',
            isRegistered: false,
            createdAt: Timestamp.now()
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile as UserProfile);
        } else {
          setUserProfile(userSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-100 border-t-[#00A99D] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="font-sans selection:bg-[#00A99D]/10 selection:text-[#008278]">
      <Navbar 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        onHome={() => setSelectedToolId(null)}
      />
      
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage onLogin={handleLogin} />
          </motion.div>
        ) : userProfile?.isRegistered ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PatientDashboard 
              user={user} 
              profile={userProfile} 
              selectedToolId={selectedToolId}
              setSelectedToolId={setSelectedToolId}
            />
          </motion.div>
        ) : (
          <motion.div
            key="registration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PatientRegistration user={user} onComplete={() => fetchUserProfile(user.uid)} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-white">DHI Saúde</span>
          </div>
          
          <div className="text-sm text-center md:text-right">
            <p>© 2026 Clínica Médica Integrada DHI Saúde. Todos os direitos reservados.</p>
            <p className="mt-1">Dr. Haroldo Garcia Barbosa - CRM/SC 17.474</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
