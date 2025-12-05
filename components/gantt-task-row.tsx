"use client"

import { useState, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Briefcase, Building2, MapPin, ChevronDown, ChevronUp, GraduationCap, Code, MoreVertical } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface ExperienceDetail {
  title: string
  period?: string
  content: string
}

interface GanttTaskRowProps {
  task: {
    id: string
    title: string
    startDate: Date
    endDate: Date
    color: string
    barColor: string
    company: string
    description: string
    logo?: string
    location?: string
    experiences?: ExperienceDetail[]
    type?: "work" | "education" | "skills"
    details?: {
      items?: string[]
      honors?: string[]
      degree?: string
      institution?: string
      gpa?: string
      graduationDate?: string
    }
  }
  leftPercent: number
  widthPercent: number
  duration: number
  durationUnit: "mo" | "yr"
  index: number
  timelineIntervals: Date[]
  timeframe: "month" | "year"
  imagesLoaded: Record<string, boolean>
  isLoading: boolean
  onImageLoad: (key: string) => void
  isSubTask?: boolean
  parentTaskId?: string
  subTaskIndex?: number
  totalSubTasks?: number
  parentLeftPercent?: number
  parentWidthPercent?: number
  getTaskPosition: (task: { startDate: Date; endDate: Date }) => { leftPercent: number; widthPercent: number; duration: number; unit: "mo" | "yr" }
}

export function GanttTaskRow({
  task,
  leftPercent,
  widthPercent,
  duration,
  durationUnit,
  index,
  timelineIntervals,
  timeframe,
  imagesLoaded,
  isLoading,
  onImageLoad,
  isSubTask = false,
  parentTaskId,
  subTaskIndex = 0,
  totalSubTasks = 0,
  parentLeftPercent,
  parentWidthPercent,
  getTaskPosition,
}: GanttTaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const taskRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(taskRef, { once: true, margin: "-50px" })

  const imageKey = task.company.toLowerCase().replace(/\s+/g, "")
  const Icon = task.type === "education" ? GraduationCap : task.type === "skills" ? Code : Briefcase

  // Helper to get color value for hover effect
  const getColorValue = (colorClass: string) => {
    const colorMap: Record<string, string> = {
      'bg-blue-500': '59, 130, 246',
      'bg-purple-500': '168, 85, 247',
      'bg-green-500': '34, 197, 94',
      'bg-orange-500': '249, 115, 22',
      'bg-indigo-500': '99, 102, 241',
      'bg-teal-500': '20, 184, 166',
    }
    return colorMap[colorClass] || '59, 130, 246'
  }

  // Get sub-tasks from experiences or details
  let allSubTasks: { title: string; content: string }[] = []
  
  if (task.type === "education" && task.details) {
    // For education, create sub-tasks from details
    allSubTasks = [
      task.details.degree && { title: "Degree", content: task.details.degree },
      task.details.gpa && { title: "Academic Performance", content: task.details.gpa },
      task.details.honors && task.details.honors.length > 0 && { 
        title: "Honors & Awards", 
        content: task.details.honors.join(", ") 
      },
    ].filter(Boolean) as { title: string; content: string }[]
  } else if (task.type === "skills" && task.details?.items) {
    // For technical skills, create sub-tasks from items
    allSubTasks = task.details.items.map(item => {
      const parts = item.split(": ")
      return { title: parts[0], content: parts.slice(1).join(": ") }
    })
  } else if (task.experiences) {
    // For work experiences, use experiences as sub-tasks
    allSubTasks = task.experiences.map(exp => ({ title: exp.title, content: exp.content }))
  }

  return (
    <>
      <div ref={taskRef} className="relative" style={{ minHeight: isSubTask ? "auto" : "80px" }}>
        <div className="flex" style={{ minHeight: isSubTask ? "auto" : "80px" }}>
          {/* Company/Role Info - Sticky */}
          <div className="w-[300px] flex-shrink-0 p-4 border-r border-border/40 relative">
            <div className="flex items-center gap-3" style={{ paddingLeft: isSubTask ? "2rem" : "0" }}>
              {!isSubTask && task.logo && (
                <div className="relative h-10 w-24 flex-shrink-0">
                  {(!imagesLoaded[imageKey] || isLoading) && <Skeleton className="absolute inset-0 rounded" />}
                  <Image
                    src={task.logo}
                    alt={`${task.company} Logo`}
                    fill
                    className={`object-contain object-left transition-opacity duration-500 rounded ${
                      imagesLoaded[imageKey] && !isLoading ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => onImageLoad(imageKey)}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {!isSubTask && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  <h3 className={`font-medium ${isSubTask ? "text-xs text-muted-foreground" : "text-sm text-foreground"} truncate`}>
                    {task.title}
                  </h3>
                </div>
                {!isSubTask && task.company && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{task.company}</span>
                  </div>
                )}
                {!isSubTask && !task.company && task.type === "skills" && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Code className="w-3 h-3" />
                    <span className="truncate">Ongoing Development</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gantt Bar Area - Scrollable */}
          <div className="flex-1 relative p-4 min-w-max" style={{ minHeight: isSubTask ? "auto" : "80px" }}>
            <div className="relative" style={{ minHeight: isSubTask ? "auto" : "80px" }}>
              {/* Timeline Grid Lines */}
              <div className="absolute inset-0 flex">
                {timelineIntervals.map((_, idx) => (
                  <div 
                    key={idx} 
                    className="flex-shrink-0 border-r border-border/10" 
                    style={{ minWidth: timeframe === "month" ? "120px" : "200px" }} 
                  />
                ))}
              </div>

              {/* Connecting Line from Sub-task to Main Task Bar - Only vertical line, no horizontal through text */}
              {isSubTask && parentTaskId && parentLeftPercent !== undefined && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-border/30 z-0"
                  style={{
                    left: `${parentLeftPercent * (timelineIntervals.length * (timeframe === "month" ? 120 : 200)) / 100}px`,
                  }}
                />
              )}

              {/* Task Card */}
              <motion.div
                className={`bg-card/70 backdrop-blur-sm rounded-lg border border-border/40 transition-all cursor-pointer group ${
                  isExpanded || isHovered ? "shadow-xl z-20" : "shadow-sm"
                } ${isSubTask ? "relative" : "absolute top-1/2 -translate-y-1/2"}`}
                style={{
                  left: isSubTask && parentLeftPercent !== undefined 
                    ? `${parentLeftPercent * (timelineIntervals.length * (timeframe === "month" ? 120 : 200)) / 100}px`
                    : isSubTask 
                    ? 0 
                    : `${leftPercent * (timelineIntervals.length * (timeframe === "month" ? 120 : 200)) / 100}px`,
                  width: isSubTask && parentWidthPercent !== undefined
                    ? `${(parentWidthPercent / 100) * (timelineIntervals.length * (timeframe === "month" ? 120 : 200))}px`
                    : isSubTask
                    ? "100%"
                    : `${(widthPercent / 100) * (timelineIntervals.length * (timeframe === "month" ? 120 : 200))}px`,
                  minWidth: timeframe === "month" ? "120px" : "200px",
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={!isSubTask ? { scale: 1.01, y: -1 } : {}}
                whileTap={!isSubTask ? { scale: 0.99 } : {}}
                onHoverStart={() => !isSubTask && setIsHovered(true)}
                onHoverEnd={() => !isSubTask && setIsHovered(false)}
                onClick={() => !isSubTask && setIsExpanded(!isExpanded)}
              >
                {/* Colored Vertical Bar on Left */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${task.barColor} rounded-l-lg`} />
                
                {/* Gradient Background on Hover/Expanded - Use task color */}
                {!isSubTask && (
                  <div
                    className="absolute inset-0 rounded-lg transition-opacity duration-300"
                    style={{
                      opacity: isHovered || isExpanded ? 1 : 0,
                      backgroundColor: `rgba(${getColorValue(task.barColor)}, 0.2)`,
                    }}
                  />
                )}

                {/* Card Content */}
                <div className={`relative flex flex-col ${isSubTask ? "p-3" : "p-3"}`}>
                  <div className={`flex items-center justify-between ${isSubTask ? "mb-2" : ""}`}>
                    {!isSubTask ? (
                      <>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-medium text-sm text-foreground truncate mb-0.5">{task.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{task.description}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-xs text-muted-foreground">
                            {duration} {duration === 1 ? durationUnit : durationUnit === "mo" ? "mos" : "yrs"}
                          </div>
                          <MoreVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-muted-foreground mb-1">{task.title}</div>
                      </div>
                    )}
                  </div>
                  {/* Description for sub-task in Gantt chart area */}
                  {isSubTask && task.description && (
                    <div className="mt-1 pt-2 border-t border-border/20">
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-normal">
                        {task.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Hover Tooltip */}
                {!isSubTask && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-1.5 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                    {timeframe === "month" 
                      ? `${format(task.startDate, "MMM yyyy")} - ${task.endDate.getTime() > new Date().getTime() ? "Present" : format(task.endDate, "MMM yyyy")}`
                      : `${format(task.startDate, "yyyy")} - ${task.endDate.getTime() > new Date().getTime() ? "Present" : format(task.endDate, "yyyy")}`
                    }
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Render Sub-tasks */}
      {!isSubTask && allSubTasks.length > 0 && (
        <AnimatePresence>
          {isExpanded && (
            <>
              {allSubTasks.map((subTask, subIndex) => {
                return (
                  <GanttTaskRow
                    key={`${task.id}-sub-${subIndex}`}
                    task={{
                      ...task,
                      title: subTask.title,
                      description: subTask.content,
                    }}
                    leftPercent={leftPercent}
                    widthPercent={widthPercent}
                    duration={duration}
                    durationUnit={durationUnit}
                    index={index + subIndex + 1}
                    timelineIntervals={timelineIntervals}
                    timeframe={timeframe}
                    imagesLoaded={imagesLoaded}
                    isLoading={isLoading}
                    onImageLoad={onImageLoad}
                    isSubTask={true}
                    parentTaskId={task.id}
                    subTaskIndex={subIndex}
                    totalSubTasks={allSubTasks.length}
                    parentLeftPercent={leftPercent}
                    parentWidthPercent={widthPercent}
                    getTaskPosition={getTaskPosition}
                  />
                )
              })}
            </>
          )}
        </AnimatePresence>
      )}

      {/* Expanded Details - Only show for tasks without sub-tasks (like education) */}
      {!isSubTask && allSubTasks.length === 0 && (
        <AnimatePresence>
          {isExpanded && task.details?.institution && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden bg-card/60 border-t border-border/30"
            >
              {/* Connecting Line from Main Task to Dropdown */}
              <div className="relative">
                <div 
                  className="absolute top-0 w-0.5 bg-border/40 z-10"
                  style={{
                    left: `${leftPercent * (timelineIntervals.length * (timeframe === "month" ? 120 : 200)) / 100 + (widthPercent / 100) * (timelineIntervals.length * (timeframe === "month" ? 120 : 200)) / 2}px`,
                    height: "20px",
                  }}
                />
              </div>
              
              <div className="flex">
                {/* Left Side Description Panel */}
                <div className="w-[300px] flex-shrink-0 p-4 border-r border-border/40 bg-card/70">
                  <div className="relative">
                    {/* Colored vertical line matching task bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.barColor} rounded`} />
                    <div className="pl-4">
                      <h4 className="font-medium text-sm text-foreground mb-1">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Education details */}
                <div className="flex-1 p-6">
                  <div className="space-y-4">
                    <div className="bg-card/40 border border-border/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">{task.details.institution}</h4>
                      {task.details.degree && <p className="text-xs text-muted-foreground mb-1">{task.details.degree}</p>}
                      {task.details.graduationDate && (
                        <p className="text-xs text-muted-foreground mb-1">Expected Graduation: {task.details.graduationDate}</p>
                      )}
                      {task.details.gpa && <p className="text-xs text-muted-foreground">{task.details.gpa}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  )
}

