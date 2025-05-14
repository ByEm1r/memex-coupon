import React from 'react';

interface PaginationProps {
  paginate: (pageNumber: number) => void;
  pageNumbers: number[];
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ paginate, pageNumbers, currentPage }) => {
  return (
    <nav className="pagination">
      <ul className="pagination-list">
        {pageNumbers.map(number => (
          <li key={number} className="pagination-item">
            <button
              onClick={() => paginate(number)}
              className={`pagination-link ${number === currentPage ? 'active' : ''}`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;
