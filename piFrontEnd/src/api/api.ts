// API utility functions for the admin dashboard

/**
 * Fetch all users from the API
 */
export const fetchUsers = async () => {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  };
  
  /**
   * Update a user's status (active/inactive)
   */
  export const updateUserStatus = async (userId: string, status: boolean) => {
    const response = await fetch(`/api/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user status');
    }
    
    return response.json();
  };
  
  /**
   * Update an expert application status
   */
//   export const updateExpertStatus = async (userId: string, status: 'approved' | 'rejected') => {
//     const response = await fetch(`/api/users/${userId}/expert-application`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ status }),
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to update expert application status');
//     }
    
//     return response.json();
//   };
  
  /**
   * Fetch all reports
   */
//   export const fetchReports = async () => {
//     const response = await fetch('/api/reports');
//     if (!response.ok) {
//       throw new Error('Failed to fetch reports');
//     }
//     return response.json();
//   };
  
//   /**
//    * Take action on a report
//    */
//   export const takeReportAction = async (
//     reportId: string, 
//     action: 'ban' | 'suspend' | 'warn',
//     details: { duration?: number; message?: string }
//   ) => {
//     const response = await fetch(`/api/reports/${reportId}/action`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ action, details }),
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to take action on report');
//     }
    
//     return response.json();
//   };
  
//   /**
//    * Resolve or dismiss a report
//    */
//   export const resolveReport = async (reportId: string, resolution: 'resolve' | 'dismiss') => {
//     const response = await fetch(`/api/reports/${reportId}/resolution`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ resolution }),
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to resolve report');
//     }
    
//     return response.json();
//   };