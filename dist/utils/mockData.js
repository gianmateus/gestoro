"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinancialSummary = exports.getAllRestaurantsStats = exports.getRestaurantStaff = exports.getRestaurantEvents = exports.getRestaurantPurchases = exports.getRestaurantInventory = exports.getRestaurantAccounts = exports.getRestaurantStats = exports.getRestaurantMockData = void 0;
const laBellaVistaMockData = {
    accounts: {
        payable: [
            {
                id: 'pay-001',
                description: 'Importazione Vini Italiani Premium',
                amount: 2850.00,
                dueDate: '2024-12-15',
                status: 'PENDING',
                category: 'BEVERAGES',
                vendor: 'Vini d\'Italia GmbH'
            },
            {
                id: 'pay-002',
                description: 'Formaggi DOP - Parmigiano e Gorgonzola',
                amount: 1425.50,
                dueDate: '2024-12-20',
                status: 'PAID',
                category: 'FOOD_SUPPLIES',
                vendor: 'Caseificio Romano'
            },
            {
                id: 'pay-003',
                description: 'Pasta Fresca Artesanal',
                amount: 890.00,
                dueDate: '2024-12-12',
                status: 'PENDING',
                category: 'FOOD_SUPPLIES',
                vendor: 'Pastificio Napoletano'
            },
            {
                id: 'pay-004',
                description: 'Equipamentos Cozinha Italiana',
                amount: 3200.00,
                dueDate: '2024-12-25',
                status: 'PENDING',
                category: 'EQUIPMENT',
                vendor: 'Italian Kitchen Pro'
            },
            {
                id: 'pay-005',
                description: 'Aluguel Dezembro 2024',
                amount: 4500.00,
                dueDate: '2024-12-01',
                status: 'PAID',
                category: 'RENT',
                vendor: 'Immobilien Berlin'
            },
            {
                id: 'pay-006',
                description: 'Energia Elétrica',
                amount: 567.80,
                dueDate: '2024-12-10',
                status: 'PENDING',
                category: 'UTILITIES',
                vendor: 'Vattenfall'
            }
        ],
        receivable: [
            {
                id: 'rec-001',
                description: 'Evento Corporativo - Empresa TechBerlin',
                amount: 5600.00,
                dueDate: '2024-12-30',
                status: 'PENDING',
                category: 'EVENTS',
                customer: 'TechBerlin GmbH'
            },
            {
                id: 'rec-002',
                description: 'Catering Casamento - Villa Toskana',
                amount: 8900.00,
                dueDate: '2024-12-28',
                status: 'CONFIRMED',
                category: 'CATERING',
                customer: 'Villa Toskana Events'
            },
            {
                id: 'rec-003',
                description: 'Curso de Culinária Italiana',
                amount: 1200.00,
                dueDate: '2024-12-22',
                status: 'PAID',
                category: 'COURSES',
                customer: 'Culinary Academy Berlin'
            }
        ]
    },
    inventory: [
        {
            id: 'inv-001',
            name: 'San Marzano Tomaten DOP',
            category: 'Vegetables',
            quantity: 45.0,
            unit: 'kg',
            minQuantity: 20,
            costPrice: 8.50,
            supplier: 'Italian Imports'
        },
        {
            id: 'inv-002',
            name: 'Parmigiano Reggiano 24 Monate',
            category: 'Dairy',
            quantity: 12.5,
            unit: 'kg',
            minQuantity: 8,
            costPrice: 32.00,
            supplier: 'Caseificio Romano'
        },
        {
            id: 'inv-003',
            name: 'Pasta Tagliatelle Fresca',
            category: 'Pasta',
            quantity: 28.0,
            unit: 'kg',
            minQuantity: 15,
            costPrice: 12.80,
            supplier: 'Pastificio Napoletano'
        },
        {
            id: 'inv-004',
            name: 'Chianti Classico DOCG',
            category: 'Wine',
            quantity: 24.0,
            unit: 'bottles',
            minQuantity: 12,
            costPrice: 18.50,
            supplier: 'Vini d\'Italia'
        },
        {
            id: 'inv-005',
            name: 'Azeite Extra Virgem Toscano',
            category: 'Oils',
            quantity: 15.0,
            unit: 'liters',
            minQuantity: 8,
            costPrice: 25.00,
            supplier: 'Frantoio Toscano'
        },
        {
            id: 'inv-006',
            name: 'Prosciutto di Parma',
            category: 'Meat',
            quantity: 8.5,
            unit: 'kg',
            minQuantity: 5,
            costPrice: 45.00,
            supplier: 'Salumificio Parma'
        }
    ],
    purchases: [
        {
            id: 'pur-001',
            orderNumber: 'BV-2024-001',
            supplier: 'Italian Imports',
            orderDate: '2024-12-01',
            status: 'DELIVERED',
            totalAmount: 2850.00
        },
        {
            id: 'pur-002',
            orderNumber: 'BV-2024-002',
            supplier: 'Vini d\'Italia GmbH',
            orderDate: '2024-12-03',
            status: 'SHIPPED',
            totalAmount: 1890.50
        },
        {
            id: 'pur-003',
            orderNumber: 'BV-2024-003',
            supplier: 'Pastificio Napoletano',
            orderDate: '2024-12-05',
            status: 'PENDING',
            totalAmount: 1250.00
        }
    ],
    events: [
        {
            id: 'evt-001',
            title: 'Entrega Vinhos Italianos',
            startDate: '2024-12-15T10:00:00',
            type: 'DELIVERY',
            priority: 'MEDIUM'
        },
        {
            id: 'evt-002',
            title: 'Evento Corporativo TechBerlin',
            startDate: '2024-12-20T19:00:00',
            type: 'EVENT',
            priority: 'HIGH'
        },
        {
            id: 'evt-003',
            title: 'Curso Culinária Italiana',
            startDate: '2024-12-22T14:00:00',
            type: 'COURSE',
            priority: 'MEDIUM'
        },
        {
            id: 'evt-004',
            title: 'Catering Casamento Villa Toskana',
            startDate: '2024-12-28T16:00:00',
            type: 'CATERING',
            priority: 'URGENT'
        }
    ],
    staff: [
        {
            id: 'staff-001',
            name: 'Giuseppe Romano',
            role: 'Head Chef',
            department: 'Kitchen',
            salary: 4500.00,
            startDate: '2023-03-15'
        },
        {
            id: 'staff-002',
            name: 'Maria Rossi',
            role: 'Sous Chef',
            department: 'Kitchen',
            salary: 3200.00,
            startDate: '2023-06-01'
        },
        {
            id: 'staff-003',
            name: 'Antonio Silva',
            role: 'Sommelier',
            department: 'Service',
            salary: 2800.00,
            startDate: '2023-09-10'
        },
        {
            id: 'staff-004',
            name: 'Isabella Ferrari',
            role: 'Maître',
            department: 'Service',
            salary: 2900.00,
            startDate: '2023-02-20'
        },
        {
            id: 'staff-005',
            name: 'Marco Benedetti',
            role: 'Waiter',
            department: 'Service',
            salary: 2200.00,
            startDate: '2024-01-15'
        }
    ],
    stats: {
        dailyRevenue: 2485.00,
        orders: 127,
        appointments: 18,
        weeklyProfit: 14900.00
    }
};
const zurGoldenenGansMockData = {
    accounts: {
        payable: [
            {
                id: 'pay-003',
                description: 'Augustiner Bier - Lieferung 500L',
                amount: 1200.00,
                dueDate: '2024-12-18',
                status: 'PENDING',
                category: 'BEVERAGES',
                vendor: 'Augustiner Bräu München'
            },
            {
                id: 'pay-004',
                description: 'Schweinefleisch Bio-Qualität',
                amount: 890.50,
                dueDate: '2024-12-14',
                status: 'PAID',
                category: 'FOOD_SUPPLIES',
                vendor: 'Fleischerei Müller'
            },
            {
                id: 'pay-007',
                description: 'Sauerkraut und Rotkohl - 50kg',
                amount: 245.80,
                dueDate: '2024-12-16',
                status: 'PENDING',
                category: 'FOOD_SUPPLIES',
                vendor: 'Gemüse Großhandel Schmidt'
            },
            {
                id: 'pay-008',
                description: 'Stromrechnung November',
                amount: 456.90,
                dueDate: '2024-12-08',
                status: 'PAID',
                category: 'UTILITIES',
                vendor: 'Stadtwerke Berlin'
            },
            {
                id: 'pay-009',
                description: 'Brezel und Brot täglich',
                amount: 320.00,
                dueDate: '2024-12-20',
                status: 'PENDING',
                category: 'FOOD_SUPPLIES',
                vendor: 'Bäckerei Krause'
            },
            {
                id: 'pay-010',
                description: 'Gasrechnung Dezember',
                amount: 678.45,
                dueDate: '2024-12-12',
                status: 'PENDING',
                category: 'UTILITIES',
                vendor: 'GASAG Berlin'
            }
        ],
        receivable: [
            {
                id: 'rec-004',
                description: 'Oktoberfest Event - Firma AutoBerlin',
                amount: 3400.00,
                dueDate: '2024-12-31',
                status: 'CONFIRMED',
                category: 'EVENTS',
                customer: 'AutoBerlin GmbH'
            },
            {
                id: 'rec-005',
                description: 'Weihnachtsfeier Catering',
                amount: 2800.00,
                dueDate: '2024-12-23',
                status: 'PENDING',
                category: 'CATERING',
                customer: 'Berliner Sparkasse'
            },
            {
                id: 'rec-006',
                description: 'Stammtisch Reservierung Gruppe',
                amount: 890.00,
                dueDate: '2024-12-15',
                status: 'PAID',
                category: 'RESERVATIONS',
                customer: 'Handwerker Verein'
            }
        ]
    },
    inventory: [
        {
            id: 'inv-007',
            name: 'Schweineschulter',
            category: 'Meat',
            quantity: 35.5,
            unit: 'kg',
            minQuantity: 20,
            costPrice: 12.80,
            supplier: 'Fleischerei Müller'
        },
        {
            id: 'inv-008',
            name: 'Sauerkraut',
            category: 'Vegetables',
            quantity: 25.0,
            unit: 'kg',
            minQuantity: 15,
            costPrice: 3.20,
            supplier: 'Gemüse Schmidt'
        },
        {
            id: 'inv-009',
            name: 'Augustiner Bier Fass',
            category: 'Beverages',
            quantity: 12.0,
            unit: 'Fässer',
            minQuantity: 6,
            costPrice: 95.00,
            supplier: 'Augustiner Bräu'
        },
        {
            id: 'inv-010',
            name: 'Kartoffeln festkochend',
            category: 'Vegetables',
            quantity: 80.0,
            unit: 'kg',
            minQuantity: 40,
            costPrice: 1.80,
            supplier: 'Bauernhof Brandenburg'
        },
        {
            id: 'inv-011',
            name: 'Senf mittelscharf',
            category: 'Condiments',
            quantity: 18.0,
            unit: 'Gläser',
            minQuantity: 10,
            costPrice: 4.50,
            supplier: 'Löwensenf'
        },
        {
            id: 'inv-012',
            name: 'Brezel frisch täglich',
            category: 'Bakery',
            quantity: 50.0,
            unit: 'Stück',
            minQuantity: 30,
            costPrice: 1.20,
            supplier: 'Bäckerei Krause'
        }
    ],
    purchases: [
        {
            id: 'pur-004',
            orderNumber: 'GG-2024-001',
            supplier: 'Augustiner Bräu München',
            orderDate: '2024-11-28',
            status: 'DELIVERED',
            totalAmount: 1850.00
        },
        {
            id: 'pur-005',
            orderNumber: 'GG-2024-002',
            supplier: 'Fleischerei Müller',
            orderDate: '2024-12-02',
            status: 'DELIVERED',
            totalAmount: 1290.50
        },
        {
            id: 'pur-006',
            orderNumber: 'GG-2024-003',
            supplier: 'Gemüse Schmidt',
            orderDate: '2024-12-04',
            status: 'PENDING',
            totalAmount: 680.00
        }
    ],
    events: [
        {
            id: 'evt-005',
            title: 'Bier Lieferung Augustiner',
            startDate: '2024-12-18T09:00:00',
            type: 'DELIVERY',
            priority: 'HIGH'
        },
        {
            id: 'evt-006',
            title: 'Oktoberfest Event AutoBerlin',
            startDate: '2024-12-21T18:00:00',
            type: 'EVENT',
            priority: 'URGENT'
        },
        {
            id: 'evt-007',
            title: 'Weihnachtsfeier Sparkasse',
            startDate: '2024-12-23T19:30:00',
            type: 'CATERING',
            priority: 'HIGH'
        },
        {
            id: 'evt-008',
            title: 'Stammtisch Handwerker',
            startDate: '2024-12-15T20:00:00',
            type: 'RESERVATION',
            priority: 'MEDIUM'
        }
    ],
    staff: [
        {
            id: 'staff-006',
            name: 'Hans Müller',
            role: 'Küchenchef',
            department: 'Kitchen',
            salary: 4200.00,
            startDate: '2022-10-01'
        },
        {
            id: 'staff-007',
            name: 'Greta Schmidt',
            role: 'Kellnerin',
            department: 'Service',
            salary: 2400.00,
            startDate: '2023-05-15'
        },
        {
            id: 'staff-008',
            name: 'Fritz Weber',
            role: 'Barkeeper',
            department: 'Bar',
            salary: 2600.00,
            startDate: '2023-01-10'
        },
        {
            id: 'staff-009',
            name: 'Ingrid Bauer',
            role: 'Serviceleiterin',
            department: 'Service',
            salary: 3100.00,
            startDate: '2022-08-20'
        }
    ],
    stats: {
        dailyRevenue: 1980.00,
        orders: 89,
        appointments: 12,
        weeklyProfit: 11200.00
    }
};
const sakuraSushiMockData = {
    accounts: {
        payable: [
            {
                id: 'pay-005',
                description: 'Frischer Thunfisch',
                amount: 1200.00,
                dueDate: '2024-12-08',
                status: 'PAID',
                category: 'FOOD_SUPPLIES',
                vendor: 'Tsukiji Fish Market Berlin'
            },
            {
                id: 'pay-006',
                description: 'Reinigungsservice',
                amount: 320.00,
                dueDate: '2024-12-12',
                status: 'PENDING',
                category: 'MAINTENANCE',
                vendor: 'Clean Master Services'
            }
        ],
        receivable: [
            {
                id: 'rec-003',
                description: 'Sushi Kurs Workshop',
                amount: 890.00,
                dueDate: '2024-12-25',
                status: 'PENDING',
                category: 'EVENTS',
                customer: 'Kochschule Berlin'
            }
        ]
    },
    inventory: [
        {
            id: 'inv-005',
            name: 'Sushi Reis',
            category: 'Grundzutaten',
            quantity: 45.0,
            unit: 'kg',
            minQuantity: 20,
            costPrice: 4.80,
            supplier: 'Asia Import'
        },
        {
            id: 'inv-006',
            name: 'Nori Blätter',
            category: 'Zutaten',
            quantity: 12.0,
            unit: 'Packungen',
            minQuantity: 8,
            costPrice: 15.00,
            supplier: 'Japan Food Trading'
        }
    ],
    purchases: [
        {
            id: 'pur-003',
            orderNumber: 'SS-2024-003',
            supplier: 'Tsukiji Fish Market Berlin',
            orderDate: '2024-11-30',
            status: 'DELIVERED',
            totalAmount: 1450.00
        }
    ],
    events: [
        {
            id: 'evt-003',
            title: 'Fisch Lieferung',
            startDate: '2024-12-08T08:00:00',
            type: 'DELIVERY',
            priority: 'URGENT'
        }
    ],
    staff: [
        {
            id: 'staff-010',
            name: 'Hiroshi Tanaka',
            role: 'Sushi Master',
            department: 'Kitchen',
            salary: 5200.00,
            startDate: '2022-06-01'
        },
        {
            id: 'staff-011',
            name: 'Yuki Sato',
            role: 'Sous Chef',
            department: 'Kitchen',
            salary: 3800.00,
            startDate: '2023-02-15'
        },
        {
            id: 'staff-012',
            name: 'Akira Yamamoto',
            role: 'Waiter',
            department: 'Service',
            salary: 2600.00,
            startDate: '2023-08-20'
        }
    ],
    stats: {
        dailyRevenue: 3120.00,
        orders: 156,
        appointments: 12,
        weeklyProfit: 18900.00
    }
};
const leJardinFrancaisMockData = {
    accounts: {
        payable: [
            {
                id: 'pay-011',
                description: 'Vins de Bordeaux Premium',
                amount: 3200.00,
                dueDate: '2024-12-22',
                status: 'PENDING',
                category: 'BEVERAGES',
                vendor: 'Caves de Bordeaux'
            },
            {
                id: 'pay-012',
                description: 'Foie Gras et Truffes',
                amount: 1890.00,
                dueDate: '2024-12-18',
                status: 'PAID',
                category: 'FOOD_SUPPLIES',
                vendor: 'Délices de Périgord'
            },
            {
                id: 'pay-013',
                description: 'Fromages Français Artisanaux',
                amount: 950.50,
                dueDate: '2024-12-25',
                status: 'PENDING',
                category: 'FOOD_SUPPLIES',
                vendor: 'Fromagerie Laurent Dubois'
            },
            {
                id: 'pay-014',
                description: 'Equipment Cuisine Professionnelle',
                amount: 2850.00,
                dueDate: '2024-12-30',
                status: 'PENDING',
                category: 'EQUIPMENT',
                vendor: 'Matfer Bourgeat'
            }
        ],
        receivable: [
            {
                id: 'rec-007',
                description: 'Dîner de Gala Ambassade',
                amount: 12500.00,
                dueDate: '2024-12-28',
                status: 'CONFIRMED',
                category: 'EVENTS',
                customer: 'Ambassade de France'
            },
            {
                id: 'rec-008',
                description: 'Cours de Cuisine Française',
                amount: 2400.00,
                dueDate: '2024-12-24',
                status: 'PENDING',
                category: 'COURSES',
                customer: 'École Culinaire Berlin'
            }
        ]
    },
    inventory: [
        {
            id: 'inv-013',
            name: 'Champagne Dom Pérignon',
            category: 'Beverages',
            quantity: 24.0,
            unit: 'bottles',
            minQuantity: 12,
            costPrice: 180.00,
            supplier: 'Champagne Direct'
        },
        {
            id: 'inv-014',
            name: 'Foie Gras de Canard',
            category: 'Delicacies',
            quantity: 3.5,
            unit: 'kg',
            minQuantity: 2,
            costPrice: 120.00,
            supplier: 'Délices de Périgord'
        },
        {
            id: 'inv-015',
            name: 'Truffes Noires du Périgord',
            category: 'Delicacies',
            quantity: 0.8,
            unit: 'kg',
            minQuantity: 0.5,
            costPrice: 800.00,
            supplier: 'Truffe Dorée'
        },
        {
            id: 'inv-016',
            name: 'Beurre d\'Isigny AOP',
            category: 'Dairy',
            quantity: 15.0,
            unit: 'kg',
            minQuantity: 8,
            costPrice: 12.50,
            supplier: 'Isigny Sainte-Mère'
        }
    ],
    purchases: [
        {
            id: 'pur-007',
            orderNumber: 'JF-2024-001',
            supplier: 'Caves de Bordeaux',
            orderDate: '2024-12-01',
            status: 'SHIPPED',
            totalAmount: 4200.00
        },
        {
            id: 'pur-008',
            orderNumber: 'JF-2024-002',
            supplier: 'Délices de Périgord',
            orderDate: '2024-12-05',
            status: 'DELIVERED',
            totalAmount: 2890.00
        }
    ],
    events: [
        {
            id: 'evt-009',
            title: 'Dîner Ambassade de France',
            startDate: '2024-12-28T19:00:00',
            type: 'EVENT',
            priority: 'URGENT'
        },
        {
            id: 'evt-010',
            title: 'Livraison Vins Bordeaux',
            startDate: '2024-12-22T11:00:00',
            type: 'DELIVERY',
            priority: 'HIGH'
        },
        {
            id: 'evt-011',
            title: 'Cours Cuisine Française',
            startDate: '2024-12-24T15:00:00',
            type: 'COURSE',
            priority: 'MEDIUM'
        }
    ],
    staff: [
        {
            id: 'staff-013',
            name: 'Jean-Pierre Dubois',
            role: 'Chef Exécutif',
            department: 'Kitchen',
            salary: 6200.00,
            startDate: '2021-09-01'
        },
        {
            id: 'staff-014',
            name: 'Marie Lefèvre',
            role: 'Pâtissière',
            department: 'Kitchen',
            salary: 4100.00,
            startDate: '2022-03-15'
        },
        {
            id: 'staff-015',
            name: 'Antoine Moreau',
            role: 'Sommelier',
            department: 'Service',
            salary: 3800.00,
            startDate: '2022-11-10'
        },
        {
            id: 'staff-016',
            name: 'Camille Rousseau',
            role: 'Maître d\'Hôtel',
            department: 'Service',
            salary: 3500.00,
            startDate: '2023-01-20'
        }
    ],
    stats: {
        dailyRevenue: 4280.00,
        orders: 78,
        appointments: 22,
        weeklyProfit: 24500.00
    }
};
const mumbaiSpicePalaceMockData = {
    accounts: {
        payable: [
            {
                id: 'pay-015',
                description: 'Especiarias Importadas da Índia',
                amount: 1450.00,
                dueDate: '2024-12-20',
                status: 'PENDING',
                category: 'FOOD_SUPPLIES',
                vendor: 'Spice Garden Mumbai'
            },
            {
                id: 'pay-016',
                description: 'Basmati Rice Premium 100kg',
                amount: 680.00,
                dueDate: '2024-12-15',
                status: 'PAID',
                category: 'FOOD_SUPPLIES',
                vendor: 'India Export House'
            },
            {
                id: 'pay-017',
                description: 'Tandoor Oven Maintenance',
                amount: 850.00,
                dueDate: '2024-12-28',
                status: 'PENDING',
                category: 'MAINTENANCE',
                vendor: 'Tandoor Masters'
            }
        ],
        receivable: [
            {
                id: 'rec-009',
                description: 'Bollywood Night Event',
                amount: 4200.00,
                dueDate: '2024-12-30',
                status: 'CONFIRMED',
                category: 'EVENTS',
                customer: 'Bollywood Club Berlin'
            },
            {
                id: 'rec-010',
                description: 'Indian Wedding Catering',
                amount: 8900.00,
                dueDate: '2024-12-26',
                status: 'PENDING',
                category: 'CATERING',
                customer: 'Patel Family'
            }
        ]
    },
    inventory: [
        {
            id: 'inv-017',
            name: 'Garam Masala Premium',
            category: 'Spices',
            quantity: 5.0,
            unit: 'kg',
            minQuantity: 3,
            costPrice: 45.00,
            supplier: 'Spice Garden Mumbai'
        },
        {
            id: 'inv-018',
            name: 'Basmati Rice Aged',
            category: 'Grains',
            quantity: 100.0,
            unit: 'kg',
            minQuantity: 50,
            costPrice: 6.80,
            supplier: 'India Export House'
        },
        {
            id: 'inv-019',
            name: 'Ghee Puro',
            category: 'Dairy',
            quantity: 20.0,
            unit: 'kg',
            minQuantity: 10,
            costPrice: 18.50,
            supplier: 'Amul India'
        },
        {
            id: 'inv-020',
            name: 'Naan Bread Mix',
            category: 'Bakery',
            quantity: 25.0,
            unit: 'kg',
            minQuantity: 15,
            costPrice: 8.90,
            supplier: 'Bread Masters India'
        }
    ],
    purchases: [
        {
            id: 'pur-009',
            orderNumber: 'MSP-2024-001',
            supplier: 'Spice Garden Mumbai',
            orderDate: '2024-12-02',
            status: 'DELIVERED',
            totalAmount: 1950.00
        },
        {
            id: 'pur-010',
            orderNumber: 'MSP-2024-002',
            supplier: 'India Export House',
            orderDate: '2024-12-06',
            status: 'SHIPPED',
            totalAmount: 1280.00
        }
    ],
    events: [
        {
            id: 'evt-012',
            title: 'Bollywood Night Event',
            startDate: '2024-12-30T20:00:00',
            type: 'EVENT',
            priority: 'HIGH'
        },
        {
            id: 'evt-013',
            title: 'Indian Wedding Catering',
            startDate: '2024-12-26T17:00:00',
            type: 'CATERING',
            priority: 'URGENT'
        },
        {
            id: 'evt-014',
            title: 'Spice Delivery',
            startDate: '2024-12-20T10:00:00',
            type: 'DELIVERY',
            priority: 'MEDIUM'
        }
    ],
    staff: [
        {
            id: 'staff-017',
            name: 'Raj Patel',
            role: 'Head Chef',
            department: 'Kitchen',
            salary: 4800.00,
            startDate: '2022-04-10'
        },
        {
            id: 'staff-018',
            name: 'Priya Sharma',
            role: 'Tandoor Specialist',
            department: 'Kitchen',
            salary: 3600.00,
            startDate: '2022-08-15'
        },
        {
            id: 'staff-019',
            name: 'Amit Kumar',
            role: 'Waiter',
            department: 'Service',
            salary: 2500.00,
            startDate: '2023-02-01'
        },
        {
            id: 'staff-020',
            name: 'Deepika Singh',
            role: 'Hostess',
            department: 'Service',
            salary: 2300.00,
            startDate: '2023-06-20'
        }
    ],
    stats: {
        dailyRevenue: 2890.00,
        orders: 142,
        appointments: 16,
        weeklyProfit: 16800.00
    }
};
const elMariachiLocoMockData = {
    accounts: {
        payable: [
            {
                id: 'pay-018',
                description: 'Tequila Premium Collection',
                amount: 2100.00,
                dueDate: '2024-12-19',
                status: 'PENDING',
                category: 'BEVERAGES',
                vendor: 'Casa Tequila Import'
            },
            {
                id: 'pay-019',
                description: 'Chiles y Especias Mexicanas',
                amount: 680.00,
                dueDate: '2024-12-16',
                status: 'PAID',
                category: 'FOOD_SUPPLIES',
                vendor: 'Mexico Spice Express'
            },
            {
                id: 'pay-020',
                description: 'Mariachi Band Payment',
                amount: 1200.00,
                dueDate: '2024-12-24',
                status: 'PENDING',
                category: 'ENTERTAINMENT',
                vendor: 'Los Mariachis de Berlin'
            }
        ],
        receivable: [
            {
                id: 'rec-011',
                description: 'Cinco de Mayo Celebration',
                amount: 6800.00,
                dueDate: '2024-12-31',
                status: 'CONFIRMED',
                category: 'EVENTS',
                customer: 'Mexican Cultural Center'
            },
            {
                id: 'rec-012',
                description: 'Tequila Tasting Event',
                amount: 1950.00,
                dueDate: '2024-12-27',
                status: 'PENDING',
                category: 'EVENTS',
                customer: 'Spirits Academy'
            }
        ]
    },
    inventory: [
        {
            id: 'inv-021',
            name: 'Tequila Blanco Premium',
            category: 'Beverages',
            quantity: 36.0,
            unit: 'bottles',
            minQuantity: 20,
            costPrice: 45.00,
            supplier: 'Casa Tequila'
        },
        {
            id: 'inv-022',
            name: 'Jalapeños en Escabeche',
            category: 'Vegetables',
            quantity: 25.0,
            unit: 'jars',
            minQuantity: 15,
            costPrice: 8.50,
            supplier: 'Mexico Spice Express'
        },
        {
            id: 'inv-023',
            name: 'Tortillas de Maíz',
            category: 'Bakery',
            quantity: 200.0,
            unit: 'packs',
            minQuantity: 100,
            costPrice: 2.80,
            supplier: 'Tortilleria Mexicana'
        },
        {
            id: 'inv-024',
            name: 'Aguacates Hass',
            category: 'Vegetables',
            quantity: 40.0,
            unit: 'kg',
            minQuantity: 25,
            costPrice: 6.90,
            supplier: 'Avocado Direct'
        }
    ],
    purchases: [
        {
            id: 'pur-011',
            orderNumber: 'EML-2024-001',
            supplier: 'Casa Tequila Import',
            orderDate: '2024-12-03',
            status: 'SHIPPED',
            totalAmount: 2890.00
        },
        {
            id: 'pur-012',
            orderNumber: 'EML-2024-002',
            supplier: 'Mexico Spice Express',
            orderDate: '2024-12-07',
            status: 'DELIVERED',
            totalAmount: 1150.00
        }
    ],
    events: [
        {
            id: 'evt-015',
            title: 'Cinco de Mayo Celebration',
            startDate: '2024-12-31T21:00:00',
            type: 'EVENT',
            priority: 'URGENT'
        },
        {
            id: 'evt-016',
            title: 'Mariachi Live Performance',
            startDate: '2024-12-24T20:30:00',
            type: 'ENTERTAINMENT',
            priority: 'HIGH'
        },
        {
            id: 'evt-017',
            title: 'Tequila Tasting Event',
            startDate: '2024-12-27T19:00:00',
            type: 'EVENT',
            priority: 'MEDIUM'
        }
    ],
    staff: [
        {
            id: 'staff-021',
            name: 'Carlos Rodriguez',
            role: 'Chef Mexicano',
            department: 'Kitchen',
            salary: 4500.00,
            startDate: '2022-07-12'
        },
        {
            id: 'staff-022',
            name: 'Isabella Martinez',
            role: 'Bartender Specialist',
            department: 'Bar',
            salary: 2900.00,
            startDate: '2023-03-01'
        },
        {
            id: 'staff-023',
            name: 'Diego Hernandez',
            role: 'Waiter',
            department: 'Service',
            salary: 2400.00,
            startDate: '2023-09-15'
        },
        {
            id: 'staff-024',
            name: 'Maria Gonzalez',
            role: 'Hostess',
            department: 'Service',
            salary: 2200.00,
            startDate: '2024-02-10'
        }
    ],
    stats: {
        dailyRevenue: 3450.00,
        orders: 165,
        appointments: 14,
        weeklyProfit: 19500.00
    }
};
const theBurgerFactoryMockData = {
    accounts: {
        payable: [
            {
                id: 'pay-021',
                description: 'Premium Beef Patties 200kg',
                amount: 1890.00,
                dueDate: '2024-12-17',
                status: 'PENDING',
                category: 'FOOD_SUPPLIES',
                vendor: 'Premium Meat Berlin'
            },
            {
                id: 'pay-022',
                description: 'Craft Beer Selection',
                amount: 950.00,
                dueDate: '2024-12-21',
                status: 'PAID',
                category: 'BEVERAGES',
                vendor: 'Berlin Brewery Collective'
            },
            {
                id: 'pay-023',
                description: 'Industrial Kitchen Equipment',
                amount: 3200.00,
                dueDate: '2024-12-29',
                status: 'PENDING',
                category: 'EQUIPMENT',
                vendor: 'Industrial Kitchen Pro'
            }
        ],
        receivable: [
            {
                id: 'rec-013',
                description: 'Corporate Lunch Catering',
                amount: 2400.00,
                dueDate: '2024-12-26',
                status: 'CONFIRMED',
                category: 'CATERING',
                customer: 'Tech Startup Berlin'
            },
            {
                id: 'rec-014',
                description: 'Burger Challenge Event',
                amount: 1800.00,
                dueDate: '2024-12-29',
                status: 'PENDING',
                category: 'EVENTS',
                customer: 'Food Challenge TV'
            }
        ]
    },
    inventory: [
        {
            id: 'inv-025',
            name: 'Angus Beef Patties',
            category: 'Meat',
            quantity: 150.0,
            unit: 'pieces',
            minQuantity: 80,
            costPrice: 8.50,
            supplier: 'Premium Meat Berlin'
        },
        {
            id: 'inv-026',
            name: 'Brioche Burger Buns',
            category: 'Bakery',
            quantity: 200.0,
            unit: 'pieces',
            minQuantity: 100,
            costPrice: 1.20,
            supplier: 'Artisan Bakery'
        },
        {
            id: 'inv-027',
            name: 'Craft Beer IPA',
            category: 'Beverages',
            quantity: 48.0,
            unit: 'bottles',
            minQuantity: 24,
            costPrice: 4.80,
            supplier: 'Berlin Brewery'
        },
        {
            id: 'inv-028',
            name: 'Sweet Potato Fries',
            category: 'Vegetables',
            quantity: 60.0,
            unit: 'kg',
            minQuantity: 30,
            costPrice: 3.90,
            supplier: 'Farm Fresh Berlin'
        }
    ],
    purchases: [
        {
            id: 'pur-013',
            orderNumber: 'BF-2024-001',
            supplier: 'Premium Meat Berlin',
            orderDate: '2024-12-04',
            status: 'DELIVERED',
            totalAmount: 2150.00
        },
        {
            id: 'pur-014',
            orderNumber: 'BF-2024-002',
            supplier: 'Berlin Brewery Collective',
            orderDate: '2024-12-08',
            status: 'SHIPPED',
            totalAmount: 1480.00
        }
    ],
    events: [
        {
            id: 'evt-018',
            title: 'Burger Challenge Event',
            startDate: '2024-12-29T18:00:00',
            type: 'EVENT',
            priority: 'HIGH'
        },
        {
            id: 'evt-019',
            title: 'Corporate Catering Setup',
            startDate: '2024-12-26T11:00:00',
            type: 'CATERING',
            priority: 'MEDIUM'
        },
        {
            id: 'evt-020',
            title: 'Meat Delivery Premium',
            startDate: '2024-12-17T09:00:00',
            type: 'DELIVERY',
            priority: 'HIGH'
        }
    ],
    staff: [
        {
            id: 'staff-025',
            name: 'Jake Thompson',
            role: 'Grill Master',
            department: 'Kitchen',
            salary: 4100.00,
            startDate: '2022-05-20'
        },
        {
            id: 'staff-026',
            name: 'Sarah Connor',
            role: 'Kitchen Manager',
            department: 'Kitchen',
            salary: 3800.00,
            startDate: '2022-11-15'
        },
        {
            id: 'staff-027',
            name: 'Mike Wilson',
            role: 'Beer Specialist',
            department: 'Bar',
            salary: 2700.00,
            startDate: '2023-04-10'
        },
        {
            id: 'staff-028',
            name: 'Emma Davis',
            role: 'Server',
            department: 'Service',
            salary: 2300.00,
            startDate: '2023-10-01'
        }
    ],
    stats: {
        dailyRevenue: 2150.00,
        orders: 198,
        appointments: 8,
        weeklyProfit: 13200.00
    }
};
const getRestaurantMockData = (restaurantId) => {
    switch (restaurantId) {
        case 'restaurant-001':
            return laBellaVistaMockData;
        case 'restaurant-002':
            return zurGoldenenGansMockData;
        case 'restaurant-003':
            return sakuraSushiMockData;
        case 'restaurant-004':
            return leJardinFrancaisMockData;
        case 'restaurant-005':
            return mumbaiSpicePalaceMockData;
        case 'restaurant-006':
            return elMariachiLocoMockData;
        case 'restaurant-007':
            return theBurgerFactoryMockData;
        default:
            return null;
    }
};
exports.getRestaurantMockData = getRestaurantMockData;
const getRestaurantStats = (restaurantId) => {
    const data = (0, exports.getRestaurantMockData)(restaurantId);
    return data ? data.stats : {
        dailyRevenue: 0,
        orders: 0,
        appointments: 0,
        weeklyProfit: 0
    };
};
exports.getRestaurantStats = getRestaurantStats;
const getRestaurantAccounts = (restaurantId) => {
    const data = (0, exports.getRestaurantMockData)(restaurantId);
    return data ? data.accounts : { payable: [], receivable: [] };
};
exports.getRestaurantAccounts = getRestaurantAccounts;
const getRestaurantInventory = (restaurantId) => {
    const data = (0, exports.getRestaurantMockData)(restaurantId);
    return data ? data.inventory : [];
};
exports.getRestaurantInventory = getRestaurantInventory;
const getRestaurantPurchases = (restaurantId) => {
    const data = (0, exports.getRestaurantMockData)(restaurantId);
    return data ? data.purchases : [];
};
exports.getRestaurantPurchases = getRestaurantPurchases;
const getRestaurantEvents = (restaurantId) => {
    const data = (0, exports.getRestaurantMockData)(restaurantId);
    return data ? data.events : [];
};
exports.getRestaurantEvents = getRestaurantEvents;
const getRestaurantStaff = (restaurantId) => {
    const data = (0, exports.getRestaurantMockData)(restaurantId);
    return data ? data.staff : [];
};
exports.getRestaurantStaff = getRestaurantStaff;
const getAllRestaurantsStats = () => {
    const restaurantIds = ['restaurant-001', 'restaurant-002', 'restaurant-003', 'restaurant-004', 'restaurant-005', 'restaurant-006', 'restaurant-007'];
    return restaurantIds.map(id => {
        const data = (0, exports.getRestaurantMockData)(id);
        return {
            id,
            stats: data ? data.stats : null
        };
    }).filter(item => item.stats !== null);
};
exports.getAllRestaurantsStats = getAllRestaurantsStats;
const getFinancialSummary = (restaurantId) => {
    const data = (0, exports.getRestaurantMockData)(restaurantId);
    if (!data)
        return null;
    const totalPayable = data.accounts.payable.reduce((sum, account) => sum + account.amount, 0);
    const totalReceivable = data.accounts.receivable.reduce((sum, account) => sum + account.amount, 0);
    const inventoryValue = data.inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
    return {
        totalPayable,
        totalReceivable,
        inventoryValue,
        netCashFlow: totalReceivable - totalPayable,
        ...data.stats
    };
};
exports.getFinancialSummary = getFinancialSummary;
//# sourceMappingURL=mockData.js.map