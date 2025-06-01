'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Users,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Award,
  AlertTriangle,
  CheckCircle,
  User,
  Briefcase,
  Star,
  Download,
  Filter,
  UserPlus,
  ClipboardList
} from 'lucide-react';
import { useEventEmitter, useEventListener } from '../../hooks/useEventBus';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  hireDate: string;
  hourlyRate: number;
  workingHours: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  status: 'active' | 'inactive' | 'vacation' | 'sick';
  contractType: 'fulltime' | 'parttime' | 'temporary' | 'intern';
  skills: string[];
  notes?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  documents: {
    contract: boolean;
    healthCertificate: boolean;
    workPermit: boolean;
  };
}

interface PersonalData {
  employees: Employee[];
  departments: string[];
  positions: string[];
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    onVacation: number;
    totalMonthlyCost: number;
  };
  workSchedule: {
    currentWeek: string;
    totalHours: number;
    overtime: number;
  };
}

export default function PersonalPage() {
  const router = useRouter();
  const { emitEmployeeCreated, emitEmployeeUpdated, emitSuccess, emitError } = useEventEmitter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('employees');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const selectedRestaurant = localStorage.getItem('selectedRestaurant');
      
      if (!token) {
        router.push('/login');
        return;
      }

      if (!selectedRestaurant) {
        router.push('/restaurants');
        return;
      }

      try {
        const restaurantData = JSON.parse(selectedRestaurant);
        setRestaurant(restaurantData);
        fetchPersonalData(restaurantData.id);
      } catch (error) {
        console.error('Error parsing restaurant data:', error);
        router.push('/restaurants');
      }
    };

    checkAuth();
  }, [router]);

  const fetchPersonalData = async (restaurantId: string) => {
    try {
      // Mock data completo para sistema de pessoal
      const mockData: PersonalData = {
        employees: [
          {
            id: '1',
            firstName: 'Marco',
            lastName: 'Silva',
            email: 'marco.silva@restaurant.de',
            phone: '+49 30 12345678',
            address: 'Hauptstraße 123, 10115 Berlin',
            position: 'Küchenchef',
            department: 'Küche',
            hireDate: '2023-01-15',
            hourlyRate: 18.50,
            workingHours: {
              monday: { start: '08:00', end: '16:00', isWorking: true },
              tuesday: { start: '08:00', end: '16:00', isWorking: true },
              wednesday: { start: '08:00', end: '16:00', isWorking: true },
              thursday: { start: '08:00', end: '16:00', isWorking: true },
              friday: { start: '08:00', end: '16:00', isWorking: true },
              saturday: { start: '10:00', end: '18:00', isWorking: true },
              sunday: { start: '00:00', end: '00:00', isWorking: false }
            },
            status: 'active',
            contractType: 'fulltime',
            skills: ['Italienische Küche', 'Pasta', 'Teamführung', 'HACCP'],
            emergencyContact: {
              name: 'Maria Silva',
              phone: '+49 30 87654321',
              relationship: 'Ehefrau'
            },
            documents: {
              contract: true,
              healthCertificate: true,
              workPermit: true
            }
          },
          {
            id: '2',
            firstName: 'Anna',
            lastName: 'Mueller',
            email: 'anna.mueller@restaurant.de',
            phone: '+49 30 23456789',
            address: 'Berliner Straße 45, 10117 Berlin',
            position: 'Servicekraft',
            department: 'Service',
            hireDate: '2023-03-10',
            hourlyRate: 12.50,
            workingHours: {
              monday: { start: '17:00', end: '23:00', isWorking: true },
              tuesday: { start: '17:00', end: '23:00', isWorking: true },
              wednesday: { start: '00:00', end: '00:00', isWorking: false },
              thursday: { start: '17:00', end: '23:00', isWorking: true },
              friday: { start: '17:00', end: '01:00', isWorking: true },
              saturday: { start: '17:00', end: '01:00', isWorking: true },
              sunday: { start: '17:00', end: '23:00', isWorking: true }
            },
            status: 'active',
            contractType: 'parttime',
            skills: ['Kundenservice', 'Mehrsprachig', 'POS-System'],
            emergencyContact: {
              name: 'Hans Mueller',
              phone: '+49 30 34567890',
              relationship: 'Vater'
            },
            documents: {
              contract: true,
              healthCertificate: true,
              workPermit: true
            }
          },
          {
            id: '3',
            firstName: 'Luigi',
            lastName: 'Rossi',
            email: 'luigi.rossi@restaurant.de',
            phone: '+49 30 34567890',
            address: 'Via Italia 78, 10119 Berlin',
            position: 'Sous Chef',
            department: 'Küche',
            hireDate: '2023-06-01',
            hourlyRate: 15.00,
            workingHours: {
              monday: { start: '14:00', end: '22:00', isWorking: true },
              tuesday: { start: '14:00', end: '22:00', isWorking: true },
              wednesday: { start: '14:00', end: '22:00', isWorking: true },
              thursday: { start: '14:00', end: '22:00', isWorking: true },
              friday: { start: '14:00', end: '24:00', isWorking: true },
              saturday: { start: '14:00', end: '24:00', isWorking: true },
              sunday: { start: '00:00', end: '00:00', isWorking: false }
            },
            status: 'vacation',
            contractType: 'fulltime',
            skills: ['Authentische italienische Küche', 'Pizza', 'Antipasti'],
            notes: 'Urlaub bis 20.01.2024',
            emergencyContact: {
              name: 'Giuseppe Rossi',
              phone: '+39 333 1234567',
              relationship: 'Bruder'
            },
            documents: {
              contract: true,
              healthCertificate: false,
              workPermit: true
            }
          },
          {
            id: '4',
            firstName: 'Sarah',
            lastName: 'Weber',
            email: 'sarah.weber@restaurant.de',
            phone: '+49 30 45678901',
            address: 'Kastanienallee 89, 10435 Berlin',
            position: 'Praktikantin',
            department: 'Service',
            hireDate: '2024-01-08',
            hourlyRate: 8.50,
            workingHours: {
              monday: { start: '16:00', end: '21:00', isWorking: true },
              tuesday: { start: '16:00', end: '21:00', isWorking: true },
              wednesday: { start: '16:00', end: '21:00', isWorking: true },
              thursday: { start: '00:00', end: '00:00', isWorking: false },
              friday: { start: '16:00', end: '21:00', isWorking: true },
              saturday: { start: '00:00', end: '00:00', isWorking: false },
              sunday: { start: '00:00', end: '00:00', isWorking: false }
            },
            status: 'active',
            contractType: 'intern',
            skills: ['Motivation', 'Lernbereitschaft'],
            emergencyContact: {
              name: 'Thomas Weber',
              phone: '+49 30 56789012',
              relationship: 'Vater'
            },
            documents: {
              contract: true,
              healthCertificate: true,
              workPermit: true
            }
          }
        ],
        departments: ['Küche', 'Service', 'Management', 'Reinigung'],
        positions: ['Küchenchef', 'Sous Chef', 'Koch', 'Servicekraft', 'Kellner', 'Manager', 'Praktikantin'],
        summary: {
          totalEmployees: 4,
          activeEmployees: 3,
          onVacation: 1,
          totalMonthlyCost: 8420.00
        },
        workSchedule: {
          currentWeek: 'KW 3 2024',
          totalHours: 152,
          overtime: 8
        }
      };

      setPersonalData(mockData);
    } catch (error) {
      console.error('Error fetching personal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'vacation': return 'Urlaub';
      case 'sick': return 'Krank';
      case 'inactive': return 'Inaktiv';
      default: return 'Unbekannt';
    }
  };

  const getContractTypeText = (type: string) => {
    switch (type) {
      case 'fulltime': return 'Vollzeit';
      case 'parttime': return 'Teilzeit';
      case 'temporary': return 'Befristet';
      case 'intern': return 'Praktikum';
      default: return 'Unbekannt';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateWeeklyHours = (workingHours: Employee['workingHours']) => {
    let totalHours = 0;
    Object.values(workingHours).forEach(day => {
      if (day.isWorking) {
        const start = new Date(`2024-01-01T${day.start}`);
        const end = new Date(`2024-01-01T${day.end}`);
        if (day.end === '24:00' || day.end.startsWith('0')) {
          end.setDate(end.getDate() + 1);
        }
        totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
    });
    return totalHours;
  };

  const filteredEmployees = personalData?.employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(search.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase()) ||
      employee.position.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Personaldaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Personal & Mitarbeiter</h1>
                <p className="text-gray-600">{restaurant?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Dienstplan</span>
              </button>
              <button 
                onClick={() => {
                  setSelectedEmployee(null);
                  setShowEmployeeModal(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Mitarbeiter hinzufügen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Mitarbeiter gesamt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personalData?.summary.totalEmployees || 0}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Aktive Mitarbeiter</p>
                <p className="text-2xl font-bold text-green-600">
                  {personalData?.summary.activeEmployees || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Im Urlaub</p>
                <p className="text-2xl font-bold text-blue-600">
                  {personalData?.summary.onVacation || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Monatliche Kosten</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(personalData?.summary.totalMonthlyCost || 0)}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'employees'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mitarbeiterliste
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'schedule'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Arbeitszeiten
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'documents'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dokumente
            </button>
          </div>
        </div>

        {activeTab === 'employees' && (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Mitarbeiter durchsuchen..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">Alle Abteilungen</option>
                    {personalData?.departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">Alle Status</option>
                    <option value="active">Aktiv</option>
                    <option value="vacation">Urlaub</option>
                    <option value="sick">Krank</option>
                    <option value="inactive">Inaktiv</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Mitarbeiter</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mitarbeiter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontakt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arbeitszeit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gehalt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => {
                      const weeklyHours = calculateWeeklyHours(employee.workingHours);
                      const monthlyGross = employee.hourlyRate * weeklyHours * 4.33;
                      
                      return (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.firstName} {employee.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                                <div className="text-xs text-gray-400">
                                  Seit: {new Date(employee.hireDate).toLocaleDateString('de-DE')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{employee.position}</div>
                            <div className="text-sm text-gray-500">{employee.department}</div>
                            <div className="text-xs text-gray-400">{getContractTypeText(employee.contractType)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 flex items-center mb-1">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              {employee.phone}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                              {employee.address.split(',')[0]}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {weeklyHours.toFixed(1)}h/Woche
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatCurrency(employee.hourlyRate)}/Stunde
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(monthlyGross)}
                            </div>
                            <div className="text-xs text-gray-500">Brutto/Monat</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                              {getStatusText(employee.status)}
                            </span>
                            {employee.notes && (
                              <div className="text-xs text-gray-500 mt-1">{employee.notes}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setShowEmployeeModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Arbeitszeiten - {personalData?.workSchedule.currentWeek}
              </h3>
              <div className="flex space-x-4 text-sm">
                <div className="text-gray-600">
                  Gesamt: <span className="font-medium">{personalData?.workSchedule.totalHours}h</span>
                </div>
                <div className="text-orange-600">
                  Überstunden: <span className="font-medium">{personalData?.workSchedule.overtime}h</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-8 gap-2 text-xs font-medium text-gray-500 mb-4">
              <div>Mitarbeiter</div>
              <div className="text-center">Montag</div>
              <div className="text-center">Dienstag</div>
              <div className="text-center">Mittwoch</div>
              <div className="text-center">Donnerstag</div>
              <div className="text-center">Freitag</div>
              <div className="text-center">Samstag</div>
              <div className="text-center">Sonntag</div>
            </div>
            
            {personalData?.employees.map(employee => (
              <div key={employee.id} className="grid grid-cols-8 gap-2 py-3 border-b border-gray-100 last:border-0">
                <div className="font-medium text-sm">
                  {employee.firstName} {employee.lastName}
                </div>
                {Object.entries(employee.workingHours).map(([day, hours]) => (
                  <div key={day} className="text-center text-xs">
                    {hours.isWorking ? (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {hours.start}-{hours.end}
                      </div>
                    ) : (
                      <div className="text-gray-400">Frei</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Dokumente Status</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Mitarbeiter</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-500">Arbeitsvertrag</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-500">Gesundheitszeugnis</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-500">Arbeitserlaubnis</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-500">Vollständigkeit</th>
                  </tr>
                </thead>
                <tbody>
                  {personalData?.employees.map(employee => {
                    const completeness = Object.values(employee.documents).filter(Boolean).length;
                    const total = Object.keys(employee.documents).length;
                    const percentage = (completeness / total) * 100;
                    
                    return (
                      <tr key={employee.id} className="border-b border-gray-100">
                        <td className="py-4 text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td className="text-center py-4">
                          {employee.documents.contract ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-4">
                          {employee.documents.healthCertificate ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-4">
                          {employee.documents.workPermit ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-4">
                          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            percentage === 100 ? 'bg-green-100 text-green-800' :
                            percentage >= 66 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {percentage.toFixed(0)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedEmployee ? 'Mitarbeiter Details' : 'Neuen Mitarbeiter hinzufügen'}
                </h3>
              </div>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {selectedEmployee && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Persönliche Informationen</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedEmployee.firstName} {selectedEmployee.lastName}</div>
                      <div><span className="font-medium">E-Mail:</span> {selectedEmployee.email}</div>
                      <div><span className="font-medium">Telefon:</span> {selectedEmployee.phone}</div>
                      <div><span className="font-medium">Adresse:</span> {selectedEmployee.address}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Berufliche Informationen</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Position:</span> {selectedEmployee.position}</div>
                      <div><span className="font-medium">Abteilung:</span> {selectedEmployee.department}</div>
                      <div><span className="font-medium">Anstellungsdatum:</span> {new Date(selectedEmployee.hireDate).toLocaleDateString('de-DE')}</div>
                      <div><span className="font-medium">Stundenlohn:</span> {formatCurrency(selectedEmployee.hourlyRate)}</div>
                      <div><span className="font-medium">Vertragsart:</span> {getContractTypeText(selectedEmployee.contractType)}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Fähigkeiten</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Notfallkontakt</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedEmployee.emergencyContact.name}</div>
                      <div><span className="font-medium">Telefon:</span> {selectedEmployee.emergencyContact.phone}</div>
                      <div><span className="font-medium">Beziehung:</span> {selectedEmployee.emergencyContact.relationship}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Dokumente</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        {selectedEmployee.documents.contract ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                        )}
                        Arbeitsvertrag
                      </div>
                      <div className="flex items-center">
                        {selectedEmployee.documents.healthCertificate ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                        )}
                        Gesundheitszeugnis
                      </div>
                      <div className="flex items-center">
                        {selectedEmployee.documents.workPermit ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                        )}
                        Arbeitserlaubnis
                      </div>
                    </div>
                  </div>

                  {selectedEmployee.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Notizen</h4>
                      <p className="text-sm text-gray-600">{selectedEmployee.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add New Employee Form */}
            {!selectedEmployee && (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Persönliche Informationen</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Vorname"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Nachname"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="email@restaurant.de"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+49 30 12345678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Straße, PLZ, Stadt"
                      ></textarea>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Berufliche Informationen</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Position wählen</option>
                        <option value="Küchenchef">Küchenchef</option>
                        <option value="Sous Chef">Sous Chef</option>
                        <option value="Koch">Koch</option>
                        <option value="Servicekraft">Servicekraft</option>
                        <option value="Kellner">Kellner</option>
                        <option value="Barkeeper">Barkeeper</option>
                        <option value="Manager">Manager</option>
                        <option value="Reinigungskraft">Reinigungskraft</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Abteilung *</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Abteilung wählen</option>
                        <option value="Küche">Küche</option>
                        <option value="Service">Service</option>
                        <option value="Bar">Bar</option>
                        <option value="Management">Management</option>
                        <option value="Reinigung">Reinigung</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Anstellungsdatum *</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stundenlohn (€) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="12.50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vertragsart *</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Vertragsart wählen</option>
                        <option value="fulltime">Vollzeit</option>
                        <option value="parttime">Teilzeit</option>
                        <option value="temporary">Zeitarbeit</option>
                        <option value="intern">Praktikum</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Notfallkontakt</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Vollständiger Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+49 30 87654321"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Beziehung</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        <option value="">Beziehung wählen</option>
                        <option value="Ehepartner">Ehepartner</option>
                        <option value="Elternteil">Elternteil</option>
                        <option value="Geschwister">Geschwister</option>
                        <option value="Kind">Kind</option>
                        <option value="Freund">Freund</option>
                        <option value="Sonstige">Sonstige</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Fähigkeiten</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fähigkeiten (durch Komma getrennt)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="z.B. Italienische Küche, Pasta, Teamführung, HACCP"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Notizen</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zusätzliche Informationen</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Besondere Informationen, Allergien, Verfügbarkeiten, etc."
                    ></textarea>
                  </div>
                </div>
              </form>
            )}

            <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {selectedEmployee ? 'Schließen' : 'Abbrechen'}
              </button>
              {selectedEmployee ? (
                <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Bearbeiten
                </button>
              ) : (
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    
                    // Simulate creating employee
                    const newEmployee = {
                      id: Date.now().toString(),
                      firstName: 'Neuer',
                      lastName: 'Mitarbeiter',
                      position: 'Neue Position',
                      department: 'Neues Team'
                    };
                    
                    emitEmployeeCreated(newEmployee);
                    emitSuccess('Mitarbeiter erfolgreich hinzugefügt!', 'Personal');
                    setShowEmployeeModal(false);
                  }}
                >
                  Mitarbeiter hinzufügen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Dienstplan - Wochenübersicht</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  ←
                </button>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900">Kalenderwoche 47</h4>
                  <p className="text-sm text-gray-600">18. - 24. November 2024</p>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  →
                </button>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Als PDF exportieren
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Schicht hinzufügen
                </button>
              </div>
            </div>

            {/* Schedule Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left font-medium text-gray-900 border-r">Mitarbeiter</th>
                    <th className="p-4 text-center font-medium text-gray-900 border-r">Mo<br/>18.11</th>
                    <th className="p-4 text-center font-medium text-gray-900 border-r">Di<br/>19.11</th>
                    <th className="p-4 text-center font-medium text-gray-900 border-r">Mi<br/>20.11</th>
                    <th className="p-4 text-center font-medium text-gray-900 border-r">Do<br/>21.11</th>
                    <th className="p-4 text-center font-medium text-gray-900 border-r">Fr<br/>22.11</th>
                    <th className="p-4 text-center font-medium text-gray-900 border-r">Sa<br/>23.11</th>
                    <th className="p-4 text-center font-medium text-gray-900">So<br/>24.11</th>
                  </tr>
                </thead>
                <tbody>
                  {personalData?.employees.map((employee, index) => (
                    <tr key={employee.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-4 border-r">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-medium text-sm">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employee.position}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Monday */}
                      <td className="p-2 border-r text-center">
                        {employee.workingHours.monday.isWorking ? (
                          <div className="bg-green-100 text-green-800 text-xs p-2 rounded">
                            {employee.workingHours.monday.start} - {employee.workingHours.monday.end}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">Frei</div>
                        )}
                      </td>
                      
                      {/* Tuesday */}
                      <td className="p-2 border-r text-center">
                        {employee.workingHours.tuesday.isWorking ? (
                          <div className="bg-green-100 text-green-800 text-xs p-2 rounded">
                            {employee.workingHours.tuesday.start} - {employee.workingHours.tuesday.end}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">Frei</div>
                        )}
                      </td>
                      
                      {/* Wednesday */}
                      <td className="p-2 border-r text-center">
                        {employee.workingHours.wednesday.isWorking ? (
                          <div className="bg-green-100 text-green-800 text-xs p-2 rounded">
                            {employee.workingHours.wednesday.start} - {employee.workingHours.wednesday.end}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">Frei</div>
                        )}
                      </td>
                      
                      {/* Thursday */}
                      <td className="p-2 border-r text-center">
                        {employee.workingHours.thursday.isWorking ? (
                          <div className="bg-green-100 text-green-800 text-xs p-2 rounded">
                            {employee.workingHours.thursday.start} - {employee.workingHours.thursday.end}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">Frei</div>
                        )}
                      </td>
                      
                      {/* Friday */}
                      <td className="p-2 border-r text-center">
                        {employee.workingHours.friday.isWorking ? (
                          <div className="bg-green-100 text-green-800 text-xs p-2 rounded">
                            {employee.workingHours.friday.start} - {employee.workingHours.friday.end}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">Frei</div>
                        )}
                      </td>
                      
                      {/* Saturday */}
                      <td className="p-2 border-r text-center">
                        {employee.workingHours.saturday.isWorking ? (
                          <div className="bg-green-100 text-green-800 text-xs p-2 rounded">
                            {employee.workingHours.saturday.start} - {employee.workingHours.saturday.end}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">Frei</div>
                        )}
                      </td>
                      
                      {/* Sunday */}
                      <td className="p-2 text-center">
                        {employee.workingHours.sunday.isWorking ? (
                          <div className="bg-green-100 text-green-800 text-xs p-2 rounded">
                            {employee.workingHours.sunday.start} - {employee.workingHours.sunday.end}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">Frei</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Schedule Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Gesamtstunden</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {personalData?.workSchedule.totalHours || 0}h
                </p>
                <p className="text-sm text-blue-700">Diese Woche</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Überstunden</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {personalData?.workSchedule.overtime || 0}h
                </p>
                <p className="text-sm text-orange-700">Über Normzeit</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Aktive Mitarbeiter</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {personalData?.summary.activeEmployees || 0}
                </p>
                <p className="text-sm text-green-700">Im Dienst</p>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Änderungen speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 