"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Trash2, Eye, Download, DollarSign, Users, Building, Mail, Phone, Briefcase, Loader2, Filter } from "lucide-react"
import { LandingJobService, LandingJob, CreateJobRequest, UpdateJobRequest, JobApplicant, JobsQueryParams } from "@/lib/api/landing"
import { useToast } from "@/components/ui/use-toast"
import { Pagination } from "@/components/ui/pagination"

export function CareersTab() {
  const [jobs, setJobs] = useState<LandingJob[]>([])
  const [applicants, setApplicants] = useState<JobApplicant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false)
  const [isAddJobOpen, setIsAddJobOpen] = useState(false)
  const [isEditJobOpen, setIsEditJobOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<LandingJob | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState<"opened" | "closed" | undefined>("opened")
  const [applicantsPage, setApplicantsPage] = useState(1)
  const [applicantsTotalPages, setApplicantsTotalPages] = useState(1)

  // Form states
  const [newJob, setNewJob] = useState<CreateJobRequest>({
    title: "",
    department: "",
    salaryRange: "",
    location: "",
    isRemote: false,
    jobType: "",
    experienceLevel: "",
    description: "",
    requirements: "",
    benefits: "",
    deadline: "",
    urgent: false
  })
  const [editJob, setEditJob] = useState<UpdateJobRequest>({
    title: "",
    department: "",
    salaryRange: "",
    location: "",
    isRemote: false,
    jobType: "",
    experienceLevel: "",
    description: "",
    requirements: "",
    benefits: "",
    deadline: "",
    urgent: false
  })

  const { toast } = useToast()
  const jobService = LandingJobService.getInstance()

  const fetchJobs = useCallback(async (page = 1, status?: "opened" | "closed") => {
    try {
      setIsLoading(true)
      const params: JobsQueryParams = {
        pageNo: page,
        limit: 10
      }
      if (status) params.status = status

      const response = await jobService.getJobs(params)
      if (response) {
        setJobs(response.items)
        setCurrentPage(response.currentPage)
        setTotalPages(response.totalPages)
        setTotalItems(response.totalItems)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [jobService, toast])

  const fetchApplicants = useCallback(async (jobId: string, page = 1) => {
    try {
      setIsLoadingApplicants(true)
      const response = await jobService.getJobApplicants(jobId, {
        pageNo: page,
        limit: 10
      })
      if (response) {
        setApplicants(response.items)
        setApplicantsPage(response.currentPage)
        setApplicantsTotalPages(response.totalPages)
      }
    } catch (error) {
      console.error("Error fetching applicants:", error)
      toast({
        title: "Error",
        description: "Failed to fetch applicants. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingApplicants(false)
    }
  }, [jobService, toast])

  useEffect(() => {
    fetchJobs(1, statusFilter)
  }, [fetchJobs, statusFilter])

  useEffect(() => {
    if (jobs.length > 0) {
      fetchApplicants(jobs[0].id, 1)
    }
  }, [jobs, fetchApplicants])

  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.department || !newJob.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreating(true)
      await jobService.createJob(newJob)
      toast({
        title: "Success",
        description: "Job posted successfully!"
      })
      setNewJob({
        title: "",
        department: "",
        salaryRange: "",
        location: "",
        isRemote: false,
        jobType: "",
        experienceLevel: "",
        description: "",
        requirements: "",
        benefits: "",
        deadline: "",
        urgent: false
      })
      setIsAddJobOpen(false)
      await fetchJobs(1, statusFilter)
    } catch (error) {
      console.error("Error creating job:", error)
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditJob = (job: LandingJob) => {
    setSelectedJob(job)
    setEditJob({
      title: job.title,
      department: job.department,
      salaryRange: job.salaryRange,
      location: job.location,
      isRemote: job.isRemote,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      deadline: job.deadline,
      urgent: job.urgent
    })
    setIsEditJobOpen(true)
  }

  const handleUpdateJob = async () => {
    if (!selectedJob || !editJob.title || !editJob.department || !editJob.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUpdating(true)
      await jobService.updateJob(selectedJob.id, editJob)
      toast({
        title: "Success",
        description: "Job updated successfully!"
      })
      setIsEditJobOpen(false)
      await fetchJobs(currentPage, statusFilter)
    } catch (error) {
      console.error("Error updating job:", error)
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteJob = async (id: string) => {
    try {
      setIsDeleting(id)
      await jobService.deleteJob(id)
      toast({
        title: "Success",
        description: "Job deleted successfully!"
      })
      await fetchJobs(currentPage, statusFilter)
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handlePageChange = (page: number) => {
    fetchJobs(page, statusFilter)
  }

  const handleApplicantsPageChange = (page: number) => {
    if (jobs.length > 0) {
      fetchApplicants(jobs[0].id, page)
    }
  }

  const handleStatusFilterChange = (status: "opened" | "closed" | "all") => {
    const newStatus = status === "all" ? undefined : status as "opened" | "closed"
    setStatusFilter(newStatus)
    setCurrentPage(1)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Postings */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-purple-600 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">Job Postings</span>
                </CardTitle>
                <CardDescription>Manage your job listings ({totalItems} total)</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={statusFilter || "all"} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-full sm:w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-purple-600">Post New Job</DialogTitle>
                    <DialogDescription>Create a new job posting for your company</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="job-title">Job Title *</Label>
                          <Input 
                            id="job-title" 
                            placeholder="e.g., Senior Frontend Developer" 
                            value={newJob.title}
                            onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="department">Department *</Label>
                          <Select value={newJob.department} onValueChange={(value) => setNewJob(prev => ({ ...prev, department: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Engineering">Engineering</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Sales">Sales</SelectItem>
                              <SelectItem value="Design">Design</SelectItem>
                              <SelectItem value="Human Resources">Human Resources</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary-range">Salary Range</Label>
                          <Input 
                            id="salary-range" 
                            placeholder="e.g., $70,000 - $90,000" 
                            value={newJob.salaryRange}
                            onChange={(e) => setNewJob(prev => ({ ...prev, salaryRange: e.target.value }))}
                          />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-location">Location</Label>
                          <Input 
                            id="job-location" 
                            placeholder="e.g., New York, NY" 
                            value={newJob.location}
                            onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                          />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                          <Switch 
                            checked={newJob.isRemote}
                            onCheckedChange={(checked) => setNewJob(prev => ({ ...prev, isRemote: checked }))}
                          />
                        <Label>Remote Work</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-type">Job Type</Label>
                          <Select value={newJob.jobType} onValueChange={(value) => setNewJob(prev => ({ ...prev, jobType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience-level">Experience Level</Label>
                          <Select value={newJob.experienceLevel} onValueChange={(value) => setNewJob(prev => ({ ...prev, experienceLevel: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Entry">Entry Level</SelectItem>
                              <SelectItem value="Mid">Mid Level</SelectItem>
                              <SelectItem value="Senior">Senior Level</SelectItem>
                              <SelectItem value="Lead">Lead/Principal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="job-description">Job Description *</Label>
                      <Textarea
                        id="job-description"
                        placeholder="Describe the role, responsibilities, and requirements..."
                        rows={6}
                          value={newJob.description}
                          onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements</Label>
                      <Textarea
                        id="requirements"
                        placeholder="List the required skills, experience, and qualifications..."
                        rows={4}
                          value={newJob.requirements}
                          onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="benefits">Benefits & Perks</Label>
                        <Textarea 
                          id="benefits" 
                          placeholder="Health insurance, 401k, flexible hours, etc..." 
                          rows={3} 
                          value={newJob.benefits}
                          onChange={(e) => setNewJob(prev => ({ ...prev, benefits: e.target.value }))}
                        />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="application-deadline">Application Deadline</Label>
                          <Input 
                            id="application-deadline" 
                            type="datetime-local" 
                            value={newJob.deadline}
                            onChange={(e) => setNewJob(prev => ({ ...prev, deadline: e.target.value }))}
                          />
                      </div>
                      <div className="flex items-center space-x-2">
                          <Switch 
                            checked={newJob.urgent}
                            onCheckedChange={(checked) => setNewJob(prev => ({ ...prev, urgent: checked }))}
                          />
                        <Label>Urgent Hiring</Label>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                          onClick={handleCreateJob}
                          disabled={isCreating}
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            "Post Job"
                          )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddJobOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">Loading jobs...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No jobs found</p>
                <p className="text-sm">Create your first job posting to get started</p>
              </div>
            ) : (
              <>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-purple-100 rounded-xl p-4 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium truncate">{job.title}</h4>
                          {job.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={job.isRemote ? "default" : "secondary"}
                            className={`whitespace-nowrap ${job.isRemote ? "bg-green-100 text-green-600" : ""}`}
                          >
                            {job.isRemote ? "Remote" : "On-site"}
                          </Badge>
                    <Badge
                            variant={job.status === "opened" ? "default" : "secondary"}
                            className={`whitespace-nowrap ${job.status === "opened" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                    >
                            {job.status}
                    </Badge>
                        </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        {job.salaryRange && (
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{job.salaryRange}</span>
                    </span>
                        )}
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{job.department}</span>
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{job.experienceLevel}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="hover:bg-purple-50">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-purple-50"
                      onClick={() => handleEditJob(job)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={isDeleting === job.id}
                        >
                          {isDeleting === job.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                      <Trash2 className="w-4 h-4" />
                          )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Applicants */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-purple-600 flex items-center space-x-2">
              <Users className="w-5 h-5 flex-shrink-0" />
              <span>Recent Applicants</span>
            </CardTitle>
            <CardDescription>Review job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingApplicants ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">Loading applicants...</span>
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No applicants yet</p>
                <p className="text-sm">Applications will appear here when received</p>
              </div>
            ) : (
              <>
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="border border-purple-100 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {applicant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-medium truncate">{applicant.name}</h4>
                        <p className="text-sm text-gray-600 truncate">{applicant.title}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{applicant.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{applicant.phone}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg break-words line-clamp-3">{applicant.coverLetter}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          onClick={() => window.open(applicant.cvUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download CV
                    </Button>
                    <a
                      href={`mailto:${applicant.email}?subject=Regarding Your Application&body=Hi ${applicant.name},%0D%0A%0D%0AThank you for your application.%0D%0A%0D%0ABest regards`}
                    >
                      <Button size="sm" variant="outline" className="hover:bg-purple-50">
                        <Mail className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
                {applicantsTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={applicantsPage}
                      totalPages={applicantsTotalPages}
                      onPageChange={handleApplicantsPageChange}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Job Dialog */}
      <Dialog open={isEditJobOpen} onOpenChange={setIsEditJobOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-600">Edit Job</DialogTitle>
            <DialogDescription>Update job posting details</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-job-title">Job Title *</Label>
                  <Input 
                    id="edit-job-title" 
                    value={editJob.title}
                    onChange={(e) => setEditJob(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department *</Label>
                  <Input 
                    id="edit-department" 
                    value={editJob.department}
                    onChange={(e) => setEditJob(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary-range">Salary Range</Label>
                <Input 
                  id="edit-salary-range" 
                  value={editJob.salaryRange}
                  onChange={(e) => setEditJob(prev => ({ ...prev, salaryRange: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-job-description">Job Description *</Label>
                <Textarea 
                  id="edit-job-description" 
                  value={editJob.description} 
                  rows={6} 
                  onChange={(e) => setEditJob(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={editJob.isRemote}
                  onCheckedChange={(checked) => setEditJob(prev => ({ ...prev, isRemote: checked }))}
                />
                <Label>Remote Work</Label>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  onClick={handleUpdateJob}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsEditJobOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
