"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Calendar, User, Tag, Search, Filter } from 'lucide-react';
import { LandingBlogService, LandingBlog, CreateBlogRequest, UpdateBlogRequest, BlogsQueryParams } from '@/lib/api/landing';

import { HtmlEditor } from '@/components/ui/html-editor';

const BlogTab = () => {
  const [blogs, setBlogs] = useState<LandingBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<LandingBlog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const { toast } = useToast();
  const blogService = LandingBlogService.getInstance();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    image: '',
    htmlContent: '',
    tags: [] as string[],
    category: '',
    status: 'draft' as 'published' | 'draft',
    publishAt: '',
    featured: false,
    allowComments: true,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  const [, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');



  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: BlogsQueryParams = {
        pageNo: currentPage,
        limit: 10,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter as 'published' | 'draft';
      }

      const response = await blogService.getBlogs(params);
      setBlogs(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, blogService, toast]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      image: '',
      htmlContent: '',
      tags: [],
      category: '',
      status: 'draft',
      publishAt: '',
      featured: false,
      allowComments: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: []
    });
    setTagInput('');
    setSeoKeywordInput('');
    setImageFile(null);
    setImagePreview('');
    setEditingBlog(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddSeoKeyword = () => {
    if (seoKeywordInput.trim() && !formData.seoKeywords.includes(seoKeywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, seoKeywordInput.trim()]
      }));
      setSeoKeywordInput('');
    }
  };

  const handleRemoveSeoKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.description || !formData.htmlContent) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Title, Author, Description, Content)",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Convert publishAt to ISO format if provided
      let publishAtISO = formData.publishAt;
      if (publishAtISO) {
        // Convert datetime-local format to ISO 8601
        const date = new Date(publishAtISO);
        publishAtISO = date.toISOString();
      } else {
        // Default to current date if not provided
        publishAtISO = new Date().toISOString();
      }
      
      // Ensure all fields have proper values
      const blogData: CreateBlogRequest | UpdateBlogRequest = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        image: formData.image || '', // Default to empty string if no image
        htmlContent: formData.htmlContent.trim(),
        tags: formData.tags.length > 0 ? formData.tags : [], // Ensure it's an array
        category: formData.category.trim() || 'General', // Default category
        status: formData.status,
        publishAt: publishAtISO,
        featured: formData.featured,
        allowComments: formData.allowComments,
        seoTitle: formData.seoTitle.trim() || formData.title.trim(), // Default to title if empty
        seoDescription: formData.seoDescription.trim() || formData.description.trim(), // Default to description
        seoKeywords: formData.seoKeywords.length > 0 ? formData.seoKeywords : [], // Ensure it's an array
      };

      // Debug: Log the data being sent
      console.log('Sending blog data:', blogData);

      if (editingBlog) {
        await blogService.updateBlog(editingBlog.id, blogData as UpdateBlogRequest);
        toast({
          title: "Success",
          description: "Blog updated successfully",
        });
      } else {
        await blogService.createBlog(blogData as CreateBlogRequest);
        toast({
          title: "Success",
          description: "Blog created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: "Error",
        description: "Failed to save blog",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: LandingBlog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      author: blog.author,
      description: blog.description,
      image: blog.image,
      htmlContent: blog.htmlContent,
      tags: blog.tags,
      category: blog.category,
      status: blog.status,
      publishAt: blog.publishAt,
      featured: blog.featured,
      allowComments: blog.allowComments,
      seoTitle: blog.seoTitle,
      seoDescription: blog.seoDescription,
      seoKeywords: blog.seoKeywords
    });
    setImagePreview(blog.image);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      setLoading(true);
      await blogService.deleteBlog(id);
      toast({
        title: "Success",
        description: "Blog deleted successfully",
      });
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-gray-600">Manage your blog posts and content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter blog title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Enter author name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter blog description"
                  rows={3}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Featured Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                </div>
                )}
              </div>

              {/* HTML Content Editor */}
              <div className="space-y-2">
                <Label>Content *</Label>
                <HtmlEditor
                  value={formData.htmlContent}
                  onChange={(content: string) => setFormData(prev => ({ ...prev, htmlContent: content }))}
                  placeholder="Write your blog content here..."
                  className="min-h-[300px]"
                />
              </div>

              {/* Tags */}
                <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Enter category"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'published' | 'draft') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Publish Date */}
                <div className="space-y-2">
                <Label htmlFor="publishAt">Publish Date</Label>
                <Input
                  id="publishAt"
                  type="datetime-local"
                  value={formData.publishAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishAt: e.target.value }))}
                />
              </div>

              {/* Settings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowComments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowComments: checked }))}
                  />
                  <Label htmlFor="allowComments">Allow Comments</Label>
                </div>
              </div>

              {/* SEO Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">SEO Settings</h3>

              <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="Enter SEO title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="Enter SEO description"
                    rows={2}
                  />
              </div>

              <div className="space-y-2">
                  <Label>SEO Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={seoKeywordInput}
                      onChange={(e) => setSeoKeywordInput(e.target.value)}
                      placeholder="Add a keyword"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSeoKeyword())}
                    />
                    <Button type="button" onClick={handleAddSeoKeyword}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.seoKeywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="cursor-pointer" onClick={() => handleRemoveSeoKeyword(keyword)}>
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value: 'all' | 'published' | 'draft') => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blog List */}
      <div className="grid gap-6">
        {loading && blogs.length === 0 ? (
          <div className="text-center py-8">Loading blogs...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No blogs found</p>
                        </div>
        ) : (
          filteredBlogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{blog.title}</CardTitle>
                      {blog.featured && <Badge variant="default">Featured</Badge>}
                      <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                        {blog.status}
                        </Badge>
                      </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {blog.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(blog.publishAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {blog.category}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{blog.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{blog.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  {blog.image && (
                    <div className="ml-4">
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        width={120}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(blog.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
            </div>
          </CardContent>
        </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
              </div>
  );
};

export default BlogTab;
