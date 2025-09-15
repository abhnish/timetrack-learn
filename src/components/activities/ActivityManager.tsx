import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { BookOpen, Plus, Search, Filter, Clock, Target, Tag, Edit2, Trash2 } from 'lucide-react'
import { useActivities } from '@/hooks/useActivities'

interface ActivityManagerProps {
  userRole: 'student' | 'faculty' | 'admin'
}

export default function ActivityManager({ userRole }: ActivityManagerProps) {
  const { 
    activities, 
    loading, 
    createActivity, 
    updateActivity, 
    deleteActivity, 
    getRecommendedActivities,
    searchActivities 
  } = useActivities()
  
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredActivities, setFilteredActivities] = useState(activities)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: '',
    difficulty_level: '',
    duration_minutes: '',
    target_roles: [] as string[],
    tags: ''
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      activity_type: '',
      difficulty_level: '',
      duration_minutes: '',
      target_roles: [],
      tags: ''
    })
    setEditingActivity(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const activityData = {
        title: formData.title,
        description: formData.description,
        activity_type: formData.activity_type,
        difficulty_level: formData.difficulty_level,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
        target_roles: formData.target_roles,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined
      }

      if (editingActivity) {
        await updateActivity(editingActivity.id, activityData)
      } else {
        await createActivity(activityData)
      }
      
      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error saving activity:', error)
    }
  }

  const handleEdit = (activity: any) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description || '',
      activity_type: activity.activity_type,
      difficulty_level: activity.difficulty_level || '',
      duration_minutes: activity.duration_minutes?.toString() || '',
      target_roles: activity.target_roles || [],
      tags: activity.tags ? activity.tags.join(', ') : ''
    })
    setShowCreateDialog(true)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim()) {
      setFilteredActivities(searchActivities(term))
    } else {
      setFilteredActivities(activities)
    }
  }

  React.useEffect(() => {
    setFilteredActivities(activities)
  }, [activities])

  const canManageActivities = ['faculty', 'admin'].includes(userRole)
  const displayActivities = userRole === 'student' ? getRecommendedActivities() : filteredActivities

  return (
    <Card className="shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {userRole === 'student' ? 'Recommended Activities' : 'Activity Management'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {userRole === 'student' 
                  ? 'Discover activities tailored for you'
                  : 'Create and manage learning activities'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {canManageActivities && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-primary hover:opacity-90"
                    onClick={resetForm}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Activity
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingActivity ? 'Edit Activity' : 'Create New Activity'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Study Group - Data Structures"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the activity..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="activity_type">Activity Type</Label>
                        <Select
                          value={formData.activity_type}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Academic">Academic</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Arts">Arts</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Social">Social</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="difficulty_level">Difficulty Level</Label>
                        <Select
                          value={formData.difficulty_level}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                        placeholder="e.g., 60"
                      />
                    </div>
                    
                    <div>
                      <Label>Target Roles</Label>
                      <div className="flex space-x-4 mt-2">
                        {['student', 'faculty', 'admin'].map((role) => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={role}
                              checked={formData.target_roles.includes(role)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    target_roles: [...prev.target_roles, role] 
                                  }))
                                } else {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    target_roles: prev.target_roles.filter(r => r !== role) 
                                  }))
                                }
                              }}
                            />
                            <Label htmlFor={role} className="capitalize">{role}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="e.g., programming, algorithms, beginner"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                        {editingActivity ? 'Update' : 'Create'} Activity
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activities found</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try adjusting your search' : 'Create your first activity to get started'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayActivities.map((activity) => (
              <div key={activity.id} className="p-4 rounded-lg bg-gradient-card border border-border hover:shadow-hover transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.description || 'No description available'}
                    </p>
                  </div>
                  
                  {canManageActivities && (
                    <div className="flex space-x-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(activity)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteActivity(activity.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1 text-muted-foreground">
                      <Target className="w-3 h-3" />
                      <span>{activity.activity_type}</span>
                    </span>
                    {activity.duration_minutes && (
                      <span className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{activity.duration_minutes}m</span>
                      </span>
                    )}
                  </div>
                  
                  {activity.difficulty_level && (
                    <Badge variant="outline" className="text-xs">
                      {activity.difficulty_level}
                    </Badge>
                  )}
                </div>
                
                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {activity.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="w-2 h-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {activity.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{activity.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}