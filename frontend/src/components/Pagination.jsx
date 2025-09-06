import React from "react";
import { useNavigate, createSearchParams } from "react-router-dom";


const Pagination = ({ paginationData, queryBaseUrl, search }) => {
    // Router
    const navigate = useNavigate();


    // Functions
    const handleNumberClick = (page, queryBaseUrl, search) => {
        const options = {
            pathname: `${queryBaseUrl}${page}`,
        };

        if (search !== undefined) {
            options.search = `?${createSearchParams({ search })}`;
        }

        navigate(options);
    };

    const handleBackClick = (page, queryBaseUrl, search) => {
        if (paginationData.has_previous) {
            const options = {
                pathname: `${queryBaseUrl}${page - 1}`,
            };

            if (search !== undefined) {
                options.search = `?${createSearchParams({ search })}`;
            }

            navigate(options);
        }
    };

    const handleNextClick = (page, queryBaseUrl, search) => {
        if (paginationData.has_next) {
            const options = {
                pathname: `${queryBaseUrl}${page + 1}`,
            };

            if (search !== undefined) {
                options.search = `?${createSearchParams({ search })}`;
            }
            
            navigate(options);
        }
    };

    return (
        <>
            { paginationData?.total_pages > 1 && (
                <div className="pagination-section">
                    <button 
                        onClick={ () => handleBackClick(paginationData.page, queryBaseUrl, search) }
                        className={ paginationData.has_previous ? 'button--medium--neutral-light back-button' : 'button--medium--inactive back-button' }
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={ () => handleNextClick(paginationData.page, queryBaseUrl, search) }
                        className={ paginationData.has_next ? 'button--medium--neutral-dark next-button' : 'button--medium--inactive next-button' }
                    >
                        Next Page
                    </button>
                    { paginationData?.total_pages < 5 && (
                        <div className="pagination-section__index-buttons index-buttons">
                            { Array.from({ length: paginationData.total_pages }, (_, i) => {
                                let pageNumber = i + 1;
                                    return (
                                        <button 
                                            onClick={() => handleNumberClick(pageNumber, queryBaseUrl, search)} 
                                            key={`page-${pageNumber}`} 
                                            className={ pageNumber === paginationData.page ? 'index-button--neutral--active' : 'index-button--neutral'}
                                        >
                                            { pageNumber }
                                        </button>
                                    )
                                })}
                        </div>
                    )}
                    { paginationData?.total_pages > 4 && (
                        <div className="pagination-section__index-buttons index-buttons">
                            { Array.from({ length: paginationData.total_pages }, (_, i) => {
                                const pageNumber = i + 1;
                                const currentPage = paginationData.page
                                const totalPages = paginationData.total_pages;

                                let displayIndex = false;

                                if (pageNumber < totalPages && pageNumber < totalPages - 1) {
                                    if ((pageNumber === 1 && currentPage === 1) || (pageNumber === 2 && pageNumber === currentPage + 1)) {
                                        displayIndex = true;
                                    } 

                                    if (pageNumber === currentPage || pageNumber === currentPage - 1) {
                                        displayIndex = true;
                                    }

                                    if ((pageNumber === totalPages - 2 || pageNumber === totalPages - 3) && (currentPage === totalPages - 2 || currentPage === totalPages - 1 || currentPage === totalPages)) {
                                        displayIndex = true;
                                    }
                                }

                                if (displayIndex) {
                                    return (
                                        <button 
                                        onClick={() => handleNumberClick(pageNumber, queryBaseUrl, search)} 
                                        key={`page-${pageNumber}`} 
                                        className={ pageNumber === currentPage ? 'index-button--neutral--active' : 'index-button--neutral'}
                                        >
                                            { pageNumber }
                                        </button>
                                    )
                                }
                            })}

                            {paginationData.page <= paginationData?.total_pages - 3 && (
                                <div className="pagination-section__index-buttons__dots">. . .</div>
                            )}

                            { Array.from({ length: paginationData.total_pages }, (_, i) => {
                                let pageNumber = i + 1;

                                if (pageNumber === paginationData.total_pages || pageNumber === (paginationData.total_pages - 1)) {
                                    return (
                                        <button 
                                        onClick={() => handleNumberClick(pageNumber, queryBaseUrl, search)} 
                                        key={`page-${pageNumber}`} 
                                        className={ pageNumber === paginationData.page ? 'index-button--neutral--active' : 'index-button--neutral'}
                                        >
                                            { pageNumber }
                                        </button>
                                    )
                                }
                            })}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};



export default Pagination;
