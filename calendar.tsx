import React, { useState } from 'react'
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react'

interface Event {
  id: number
  title: string
  date: Date
  clientId: number
  description?: string
  location?: string
}

interface Client {
  id: number
  name: string
}

interface CalendarProps {
  events: Event[]
  clients: Client[]
  onAddEvent: (event: Omit<Event, 'id'>) => void
}

export function Calendar({ events, clients, onAddEvent }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date(),
    clientId: 0,
    description: '',
    location: ''
  })
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false)

  const onDateClick = (day: Date) => {
    setSelectedDate(day)
    setNewEvent(prev => ({ ...prev, date: day }))
    setIsAddEventDialogOpen(true)
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleAddEvent = () => {
    onAddEvent(newEvent)
    setIsAddEventDialogOpen(false)
    setNewEvent({
      title: '',
      date: new Date(),
      clientId: 0,
      description: '',
      location: ''
    })
  }

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy"
    return (
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span className="text-lg font-bold">
          {format(currentMonth, dateFormat)}
        </span>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderDays = () => {
    const dateFormat = "EEE"
    const days = []
    let startDate = startOfWeek(currentMonth)
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="col-center text-sm font-medium text-gray-500 dark:text-gray-400">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      )
    }
    return <div className="grid grid-cols-7 gap-2 mb-2">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const dateFormat = "d"
    const rows = []

    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat)
        const cloneDay = day
        const dayEvents = events.filter(event => isSameDay(parseISO(event.date.toString()), cloneDay))
        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                : "bg-white dark:bg-gray-900"
            } ${isSameDay(day, selectedDate) ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            onClick={() => onDateClick(cloneDay)}
          >
            <span className="text-sm">{formattedDate}</span>
            <ScrollArea className="h-[80px] mt-1">
              {dayEvents.map((event, index) => (
                <Badge key={index} variant="outline" className="mb-1 block truncate">
                  {event.title}
                </Badge>
              ))}
            </ScrollArea>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      )
      days = []
    }
    return <div className="mb-4">{rows}</div>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2" />
          Law-E Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="event-date"
                  type="date"
                  value={format(newEvent.date, 'yyyy-MM-dd')}
                  onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-client" className="text-right">
                  Client
                </Label>
                <Select
                  value={newEvent.clientId.toString()}
                  onValueChange={(value) => setNewEvent({ ...newEvent, clientId: parseInt(value) })}
                >
                  <SelectTrigger className="col-span-3">
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
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-location" className="text-right">
                  Location
                </Label>
                <Input
                  id="event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddEvent}>Add Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

