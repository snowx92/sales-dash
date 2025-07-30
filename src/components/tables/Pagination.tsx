import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function Pagination({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange,
  isLoading = false,
  disabled = false
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Don't render if there's only one page or no items
  if (totalItems === 0) {
    return null;
  }

  const onNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show max 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // If total pages is less than max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of page numbers to show
      let start = Math.max(currentPage - 1, 2);
      let end = Math.min(currentPage + 1, totalPages - 1);

      // Adjust if we're near the start
      if (currentPage <= 3) {
        end = 4;
      }
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add dots if there's a gap after 1
      if (start > 2) {
        pageNumbers.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add dots if there's a gap before last page
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <nav className="flex justify-center items-center space-x-2 mt-8" aria-label="Pagination">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onPrevious} 
        disabled={isLoading || disabled || currentPage === 1}
        className="h-8 w-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((pageNumber, index) => (
        <React.Fragment key={index}>
          {pageNumber === "..." ? (
            <span className="px-2 text-purple-400">...</span>
          ) : (
            <Button
              variant={currentPage === pageNumber ? "default" : "outline"}
              onClick={() => typeof pageNumber === 'number' && onPageChange(pageNumber)}
              disabled={isLoading || disabled}
              className={`h-8 w-8 ${
                currentPage === pageNumber 
                  ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700' 
                  : 'border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300'
              } disabled:border-gray-200 disabled:text-gray-500 disabled:hover:bg-transparent`}
            >
              {pageNumber}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button 
        variant="outline" 
        size="icon" 
        onClick={onNext} 
        disabled={isLoading || disabled || currentPage === totalPages}
        className="h-8 w-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="text-sm text-purple-600 ml-4 font-medium">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  )
}

