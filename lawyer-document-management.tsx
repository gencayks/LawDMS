

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast, Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { InboxIcon, UsersIcon, FileTextIcon, PlusIcon, TrashIcon, SearchIcon, UploadIcon, SunIcon, MoonIcon, LayoutDashboardIcon, SettingsIcon, LogOutIcon, BellIcon, BarChartIcon, PieChartIcon, CalendarIcon, CheckIcon, ChevronsUpDownIcon, FilterIcon, TagIcon, ClockIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon, DownloadIcon, EyeIcon, ScaleIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { cn } from "@/lib/utils"
import { AuthPage } from './auth-page'
import { Calendar as EnhancedCalendar } from './calendar'

interface Client {
  id: number
  name: string
  email: string
  phone: string
}

interface Document {
  id: number
  title: string
  clientId: number
  category: string
  subCategory: string
  fileName: string
  fileType: string
  fileUrl: string
  createdAt: Date
}

interface Event {
  id: number
  title: string
  date: Date
  clientId: number
  description?: string
  location?: string
}

interface Task {
  id: number
  title: string
  completed: boolean
  dueDate: Date
}

interface User {
  id: number;
  name: string;
  email: string;
}

const folderStructure = {
  "Client Communication": ["Emails", "Letters", "Meeting Notes"],
  "Court Documents": ["Pleadings", "Motions", "Orders", "Judgments"],
  "Opposing Party Communication": ["Correspondence", "Negotiations", "Settlement Offers"],
  "Internal Notes/Memos": ["Case Strategy", "Research", "To-Do Lists"]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function LawEManagement() {
  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "098-765-4321" },
  ])
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, title: "Initial Complaint", clientId: 1, category: "Court Documents", subCategory: "Pleadings", fileName: "initial_complaint.pdf", fileType: "application/pdf", fileUrl: "/documents/initial_complaint.pdf", createdAt: new Date('2023-01-15') },
    { id: 2, title: "Client Meeting Notes", clientId: 2, category: "Client Communication", subCategory: "Meeting Notes", fileName: "meeting_notes.docx", fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileUrl: "/documents/meeting_notes.docx", createdAt: new Date('2023-02-20') },
    { id: 3, title: "Motion to Dismiss", clientId: 1, category: "Court Documents", subCategory: "Motions", fileName: "motion_to_dismiss.pdf", fileType: "application/pdf", fileUrl: "/documents/motion_to_dismiss.pdf", createdAt: new Date('2023-03-10') },
    { id: 4, title: "Settlement Proposal", clientId: 2, category: "Opposing Party Communication", subCategory: "Settlement Offers", fileName: "settlement_proposal.xlsx", fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileUrl: "/documents/settlement_proposal.xlsx", createdAt: new Date('2023-04-05') },
    { id: 5, title: "Case Timeline", clientId: 1, category: "Internal Notes/Memos", subCategory: "Case Strategy", fileName: "case_timeline.pptx", fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileUrl: "/documents/case_timeline.pptx", createdAt: new Date('2023-05-01') },
  ])
  const [events, setEvents] = useState<Event[]>([
    { id: 1, title: "Client Meeting", date: new Date('2023-06-15'), clientId: 1 },
    { id: 2, title: "Court Hearing", date: new Date('2023-06-20'), clientId: 2 },
    { id: 3, title: "Document Submission Deadline", date: new Date('2023-06-25'), clientId: 1 },
  ])
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({ name: "", email: "", phone: "" })
  const [newDocument, setNewDocument] = useState<Omit<Document, 'id' | 'createdAt'>>({ title: "", clientId: 0, category: "", subCategory: "", fileName: "", fileType: "", fileUrl: "" })
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({ title: "", date: new Date(), clientId: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [userSettings, setUserSettings] = useState({
    email: '',
    notifications: true,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
  })
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New client added", read: false, timestamp: new Date() },
    { id: 2, title: "Document deadline approaching", read: false, timestamp: new Date(Date.now() - 86400000) },
    { id: 3, title: "Court hearing scheduled", read: true, timestamp: new Date(Date.now() - 172800000) },
  ])
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Review contract for Client A", completed: false, dueDate: new Date(Date.now() + 259200000) },
    { id: 2, title: "Prepare for court hearing", completed: false, dueDate: new Date(Date.now() + 432000000) },
    { id: 3, title: "File motion for Client B", completed: true, dueDate: new Date(Date.now() - 86400000) },
  ])
  const [newTask, setNewTask] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date())
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'title' | 'client' | 'category' | 'date'>('title')
  const [billableHours, setBillableHours] = useState<Record<number, number>>({})
  const [user, setUser] = useState<User | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const addClient = () => {
    if (newClient.name.trim()) {
      setClients([...clients, { id: clients.length + 1, ...newClient }])
      setNewClient({ name: "", email: "", phone: "" })
      toast({
        title: "Client Added",
        description: `${newClient.name} has been added to your client list.`,
      })
    }
  }

  const deleteClient = (id: number) => {
    setClients(clients.filter(client => client.id !== id))
    setDocuments(documents.filter(doc => doc.clientId !== id))
    toast({
      title: "Client Deleted",
      description: "The client and associated documents have been removed.",
      variant: "destructive",
    })
  }

  const addDocument = () => {
    if (newDocument.title.trim() && newDocument.clientId && newDocument.category && newDocument.subCategory && newDocument.fileName) {
      setDocuments([...documents, { id: documents.length + 1, ...newDocument, createdAt: new Date() }])
      setNewDocument({ title: "", clientId: 0, category: "", subCategory: "", fileName: "", fileType: "", fileUrl: "" })
      toast({
        title: "Document Added",
        description: `${newDocument.title} has been added to your document list.`,
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewDocument({ 
        ...newDocument, 
        fileName: file.name,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file)
      })
      simulateFileUpload()
    }
  }

  const simulateFileUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prevProgress + 10
      })
    }, 500)
  }

  const addEvent = () => {
    if (newEvent.title.trim() && newEvent.clientId) {
      setEvents([...events, { id: events.length + 1, ...newEvent }])
      setNewEvent({ title: "", date: new Date(), clientId: 0 })
      toast({
        title: "Event Added",
        description: `${newEvent.title} has been added to your calendar.`,
      })
    }
  }

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients.find(c => c.id === doc.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const documentsByCategory = documents.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieChartData = Object.entries(documentsByCategory).map(([name, value]) => ({ name, value }))

  const barChartData = clients.map(client => ({
    name: client.name,
    documents: documents.filter(doc => doc.clientId === client.id).length
  }))

  const handleLogout = () => {
    setUser(null)
    setUserSettings({
      email: '',
      notifications: true,
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
    })
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const handleSettingsSave = () => {
    setIsDarkMode(userSettings.theme === "dark")
    setIsSettingsOpen(false)
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    })
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(documents)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setDocuments(items)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const filteredDocumentsByTag = useMemo(() => {
    if (selectedTags.length === 0) return filteredDocuments
    return filteredDocuments.filter((doc) =>
      selectedTags.includes(doc.category) || selectedTags.includes(doc.subCategory)
    )
  }, [filteredDocuments, selectedTags])

  const markNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    )
  }

  const addTask = (title: string, dueDate: Date) => {
    setTasks((prev) => [
      ...prev,
      { id: tasks.length + 1, title, completed: false, dueDate },
    ])
  }

  const toggleTaskCompletion = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const sortedAndFilteredDocuments = useMemo(() => {
    return documents
      .filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clients.find(c => c.id === doc.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'client':
            return (clients.find(c => c.id === a.clientId)?.name || '').localeCompare(clients.find(c => c.id === b.clientId)?.name || '')
          case 'category':
            return a.category.localeCompare(b.category)
          case 'date':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          default:
            return 0
        }
      })
  }, [documents, clients, searchTerm, sortBy])

  const downloadDocument = (doc: Document) => {
    const link = document.createElement('a')
    link.href = doc.fileUrl
    link.download = doc.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const viewDocument = (doc: Document) => {
    window.open(doc.fileUrl, '_blank')
  }

  const updateBillableHours = (clientId: number, hours: number) => {
    setBillableHours(prev => ({
      ...prev,
      [clientId]: (prev[clientId] || 0) + hours
    }))
  }

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    setUserSettings({
      ...userSettings,
      email: loggedInUser.email,
    })
    toast({
      title: "Welcome to Law-E",
      description: `Logged in successfully as ${loggedInUser.name}.`,
    })
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {user ? (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
              <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                  <div className="flex items-center flex-shrink-0 px-4">
                    <ScaleIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    <span className="ml-2 text-xl font-semibold">Law-E</span>
                  </div>
                  <nav className="mt-5 flex-1 px-2 bg-white dark:bg-gray-800 space-y-1">
                    {[
                      { name: 'Dashboard', icon: LayoutDashboardIcon, tab: 'dashboard' },
                      { name: 'Inbox', icon: InboxIcon, tab: 'inbox' },
                      { name: 'Clients', icon: UsersIcon, tab: 'clients' },
                      { name: 'Documents', icon: FileTextIcon, tab: 'documents' },
                      { name: 'Calendar', icon: CalendarIcon, tab: 'calendar' },
                      { name: 'Tasks', icon: CheckCircleIcon, tab: 'tasks' },
                    ].map((item) => (
                      <Button
                        key={item.name}
                        variant={activeTab === item.tab ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab(item.tab)}
                      >
                        <item.icon className="mr-3 h-6 w-6" />
                        {item.name}
                      </Button>
                    ))}
                  </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={`https://avatar.vercel.sh/${user.name}`} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="ml-3">{user.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleLogout}>
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
              <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-lg font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                  <div className="flex items-center">
                    <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2 relative">
                          <BellIcon className="h-5 w-5" />
                          {notifications.some((n) => !n.read) && (
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-sm font-semibold">Notifications</h2>
                          <Button variant="ghost" size="sm" onClick={() => setNotifications([])}>
                            Clear all
                          </Button>
                        </div>
                        <ScrollArea className="h-[300px]">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                notif.read ? 'opacity-50' : ''
                              }`}
                              onClick={() => markNotificationAsRead(notif.id)}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium">{notif.title}</span>
                                <span className="text-xs text-gray-500">
                                  {format(notif.timestamp, 'MMM d, HH:mm')}
                                </span>
                              </div>
                              {!notif.read && (
                                <Badge variant="secondary" className="mt-1">
                                  New
                                </Badge>
                              )}
                            </div>
                          ))}
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                      className="mr-2"
                    />
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden">Menu</Button>
                      </SheetTrigger>
                      <SheetContent side="left">
                        <SheetHeader>
                          <SheetTitle>Law-E</SheetTitle>
                          <SheetDescription>
                            Navigate through your legal document management system.
                          </SheetDescription>
                        </SheetHeader>
                        <nav className="mt-5 space-y-1">
                          {[
                            { name: 'Dashboard', icon: LayoutDashboardIcon, tab: 'dashboard' },
                            { name: 'Inbox', icon: InboxIcon, tab: 'inbox' },
                            { name: 'Clients', icon: UsersIcon, tab: 'clients' },
                            { name: 'Documents', icon: FileTextIcon, tab: 'documents' },
                            { name: 'Calendar', icon: CalendarIcon, tab: 'calendar' },
                            { name: 'Tasks', icon: CheckCircleIcon, tab: 'tasks' },
                          ].map((item) => (
                            <Button
                              key={item.name}
                              variant={activeTab === item.tab ? 'secondary' : 'ghost'}
                              className="w-full justify-start"
                              onClick={() => {
                                setActiveTab(item.tab)
                                document.body.click() // Close the sheet
                              }}
                            >
                              <item.icon className="mr-3 h-6 w-6" />
                              {item.name}
                            </Button>
                          ))}
                        </nav>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle>Total Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{clients.length}</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {clients.length > 0 ? `${((clients.length / 100) * 100).toFixed(2)}% growth` : 'No clients yet'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Total Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{documents.length}</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {documents.length > 0 ? `${((documents.length / 1000) * 100).toFixed(2)}% of storage used` : 'No documents yet'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {documents.slice(-3).reverse().map((doc) => (
                              <li key={doc.id} className="text-sm">
                                <span className="font-medium">{doc.title}</span>
                                <br />
                                <span className="text-gray-500 dark:text-gray-400">
                                  {format(new Date(doc.createdAt), 'MMM d, yyyy')} - {clients.find(c => c.id === doc.clientId)?.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="sm:col-span-2">
                        <CardHeader>
                          <CardTitle>Documents by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      <Card className="sm:col-span-2 lg:col-span-3">
                        <CardHeader>
                          <CardTitle>Documents per Client</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="documents" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      <Card className="lg:col-span-3">
                        <CardHeader>
                          <CardTitle>Document Activity Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={documents.map(doc => ({ date: new Date(doc.createdAt).getTime(), count: 1 }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM d')} />
                              <YAxis />
                              <Tooltip labelFormatter={(unixTime) => format(new Date(unixTime), 'MMM d, yyyy')} />
                              <Legend />
                              <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Total Billable Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {Object.values(billableHours).reduce((sum, hours) => sum + hours, 0)}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Across all clients
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'inbox' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <InboxIcon className="mr-2" />
                          Global Inbox
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex mb-4">
                          <Input
                            placeholder="Search documents or clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mr-2"
                          />
                          <Button variant="outline">
                            <SearchIcon className="h-4 w-4" />
                            <span className="sr-only">Search</span>
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2 mb-4">
                          <FilterIcon className="h-4 w-4" />
                          <span className="font-medium">Filter by tags:</span>
                          {Object.keys(folderStructure).map((category) => (
                            <Badge
                              key={category}
                              variant={selectedTags.includes(category) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleTagSelect(category)}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <ScrollArea className="h-[calc(100vh-300px)]">
                          <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="documents">
                              {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                  {filteredDocumentsByTag.map((doc, index) => (
                                    <Draggable key={doc.id} draggableId={doc.id.toString()} index={index}>
                                      {(provided) => (
                                        <li
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="bg-white dark:bg-gray-800 p-2 rounded shadow"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                              <FileTextIcon className="inline-block mr-2 h-4 w-4" />
                                              <span>{doc.title}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Badge variant="outline">{doc.category}</Badge>
                                              <Badge variant="outline">{doc.subCategory}</Badge>
                                              <Button onClick={() => viewDocument(doc)} variant="ghost" size="sm">
                                                <EyeIcon className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                              </Button>
                                              <Button onClick={() => downloadDocument(doc)} variant="ghost" size="sm">
                                                <DownloadIcon className="h-4 w-4" />
                                                <span className="sr-only">Download</span>
                                              </Button>
                                            </div>
                                          </div>
                                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Client: {clients.find(c => c.id === doc.clientId)?.name}
                                          </div>
                                        </li>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </ul>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'clients' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <UsersIcon className="mr-2" />
                          Clients
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[calc(100vh-300px)]">
                          <ul className="space-y-2 mb-4">
                            {clients.map((client) => (
                              <li key={client.id} className="bg-white dark:bg-gray-800 p-2 rounded shadow flex justify-between items-center">
                                <span>{client.name}</span>
                                <div>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="mr-2">View</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>{client.name}</DialogTitle>
                                      </DialogHeader>
                                      <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="client-email">Email</Label>
                                          <Input id="client-email" value={client.email} className="col-span-3" readOnly />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="client-phone">Phone</Label>
                                          <Input id="client-phone" value={client.phone} className="col-span-3" readOnly />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="client-documents">Documents</Label>
                                          <Input id="client-documents" value={documents.filter(d => d.clientId === client.id).length.toString()} className="col-span-3" readOnly />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="client-billable-hours">Billable Hours</Label>
                                          <Input id="client-billable-hours" value={billableHours[client.id] || '0'} className="col-span-3" readOnly />
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button variant="outline" size="sm" onClick={() => deleteClient(client.id)}>
                                    <TrashIcon className="h-4 w-4" />
                                    <span className="sr-only">Delete client</span>
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <Input
                            placeholder="New client name"
                            value={newClient.name}
                            onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                          />
                          <Input
                            placeholder="Email"
                            value={newClient.email}
                            onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                          />
                          <Input
                            placeholder="Phone"
                            value={newClient.phone}
                            onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                          />
                          <Button onClick={addClient} className="w-full">
                            <PlusIcon className="mr-2 h-4 w-4" /> Add Client
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'documents' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileTextIcon className="mr-2" />
                          Document Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="view" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="add">Add Document</TabsTrigger>
                            <TabsTrigger value="view">View Documents</TabsTrigger>
                          </TabsList>
                          <TabsContent value="add">
                            <div className="space-y-2">
                              <Input
                                placeholder="Document title"
                                value={newDocument.title}
                                onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                              />
                              <Select
                                value={newDocument.clientId.toString()}
                                onValueChange={(value) => setNewDocument({...newDocument, clientId: parseInt(value)})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Client" />
                                </SelectTrigger>
                                <SelectContent>
                                  {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id.toString()}>
                                      {client.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={newDocument.category}
                                onValueChange={(value) => setNewDocument({...newDocument, category: value, subCategory: ""})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(folderStructure).map((folder) => (
                                    <SelectItem key={folder} value={folder}>
                                      {folder}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {newDocument.category && (
                                <Select
                                  value={newDocument.subCategory}
                                  onValueChange={(value) => setNewDocument({...newDocument, subCategory: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Sub-Category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {folderStructure[newDocument.category].map((subFolder) => (
                                      <SelectItem key={subFolder} value={subFolder}>
                                        {subFolder}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" className="w-full" onClick={() => document.getElementById('file-upload')?.click()}>
                                  <UploadIcon className="mr-2 h-4 w-4" />
                                  {newDocument.fileName ? 'Change File' : 'Upload File'}
                                </Button>
                                <input
                                  id="file-upload"
                                  type="file"
                                  className="hidden"
                                  onChange={handleFileUpload}
                                  aria-label="Upload document file"
                                />
                              </div>
                              {newDocument.fileName && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Selected file: {newDocument.fileName}</p>
                              )}
                              <Button onClick={addDocument} className="w-full">
                                <PlusIcon className="mr-2 h-4 w-4" /> Add Document
                              </Button>
                            </div>
                          </TabsContent>
                          <TabsContent value="view">
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Input
                                  placeholder="Search documents..."
                                  className="flex-grow"
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Select onValueChange={(value) => setSortBy(value)}>
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="title">Title</SelectItem>
                                    <SelectItem value="client">Client</SelectItem>
                                    <SelectItem value="category">Category</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <ScrollArea className="h-[calc(100vh-400px)]">
                                <ul className="space-y-2">
                                  {sortedAndFilteredDocuments.map((doc) => (
                                    <li key={doc.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <FileTextIcon className="h-5 w-5 text-blue-500" />
                                          <span className="font-medium">{doc.title}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="outline">{doc.category}</Badge>
                                          <Badge variant="outline">{doc.subCategory}</Badge>
                                          <Button onClick={() => viewDocument(doc)} variant="ghost" size="sm">
                                            <EyeIcon className="h-4 w-4" />
                                            <span className="sr-only">View</span>
                                          </Button>
                                          <Button onClick={() => downloadDocument(doc)} variant="ghost" size="sm">
                                            <DownloadIcon className="h-4 w-4" />
                                            <span className="sr-only">Download</span>
                                          </Button>
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button variant="ghost" size="sm">
                                                <SearchIcon className="h-4 w-4" />
                                                <span className="sr-only">View details</span>
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>{doc.title}</DialogTitle>
                                              </DialogHeader>
                                              <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="doc-client" className="text-right">Client</Label>
                                                  <Input id="doc-client" value={clients.find(c => c.id === doc.clientId)?.name || ''} className="col-span-3" readOnly />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="doc-category" className="text-right">Category</Label>
                                                  <Input id="doc-category" value={doc.category} className="col-span-3" readOnly />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="doc-subcategory" className="text-right">Subcategory</Label>
                                                  <Input id="doc-subcategory" value={doc.subCategory} className="col-span-3" readOnly />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="doc-date" className="text-right">Created At</Label>
                                                  <Input id="doc-date" value={format(new Date(doc.createdAt), 'PPP')} className="col-span-3" readOnly />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="doc-filename" className="text-right">File Name</Label>
                                                  <Input id="doc-filename" value={doc.fileName} className="col-span-3" readOnly />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="doc-filetype" className="text-right">File Type</Label>
                                                  <Input id="doc-filetype" value={doc.fileType} className="col-span-3" readOnly />
                                                </div>
                                              </div>
                                              <DialogFooter>
                                                <Button onClick={() => viewDocument(doc)}>View Document</Button>
                                                <Button onClick={() => downloadDocument(doc)}>Download</Button>
                                              </DialogFooter>
                                            </DialogContent>
                                          </Dialog>
                                        </div>
                                      </div>
                                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Client: {clients.find(c => c.id === doc.clientId)?.name}
                                      </div>
                                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Created: {format(new Date(doc.createdAt), 'PPP')}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </ScrollArea>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'calendar' && (
                    <EnhancedCalendar
                      events={events}
                      clients={clients}
                      onAddEvent={(newEvent) => {
                        setEvents([...events, { id: events.length + 1, ...newEvent }])
                        toast({
                          title: "Event Added",
                          description: `${newEvent.title} has been added to your calendar.`,
                        })
                      }}
                    />
                  )}

                  {activeTab === 'tasks' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CheckCircleIcon className="mr-2" />
                          Tasks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <Input
                            placeholder="New task title"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                          />
                          <div className="flex items-center space-x-2">
                            <Input
                              type="date"
                              value={format(newTaskDueDate, 'yyyy-MM-dd')}
                              onChange={(e) => setNewTaskDueDate(new Date(e.target.value))}
                            />
                            <Button onClick={() => addTask(newTask, newTaskDueDate)} disabled={!newTask.trim()}>
                              <PlusIcon className="mr-2 h-4 w-4" /> Add Task
                            </Button>
                          </div>
                        </div>
                        <ScrollArea className="h-[calc(100vh-400px)]">
                          <ul className="space-y-2">
                            {tasks.map((task) => (
                              <li key={task.id} className="bg-white dark:bg-gray-800 p-2 rounded shadow flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                                    id={`task-${task.id}`}
                                  />
                                  <label
                                    htmlFor={`task-${task.id}`}
                                    className={cn(
                                      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                      task.completed && "line-through"
                                    )}
                                  >
                                    {task.title}
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={task.completed ? "secondary" : "outline"}>
                                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteTask(task.id)}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="settings-email" className="text-right">
                Email
              </Label>
              <Input
                id="settings-email"
                value={userSettings.email}
                onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="settings-notifications" className="text-right">
                Notifications
              </Label>
              <Switch
                id="settings-notifications"
                checked={userSettings.notifications}
                onCheckedChange={(checked) => setUserSettings({...userSettings, notifications: checked})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="settings-theme" className="text-right">
                Theme
              </Label>
              <Select
                value={userSettings.theme}
                onValueChange={(value) => setUserSettings({...userSettings, theme: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="settings-language" className="text-right">
                Language
              </Label>
              <Select
                value={userSettings.language || 'en'}
                onValueChange={(value) => setUserSettings({...userSettings, language: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="settings-timezone" className="text-right">
                Timezone
              </Label>
              <Select
                value={userSettings.timezone || 'UTC'}
                onValueChange={(value) => setUserSettings({...userSettings, timezone: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSettingsSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

