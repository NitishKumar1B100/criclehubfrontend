import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FaCheck } from 'react-icons/fa';
import { db } from '../../utils/firebase';
import { useNavigate } from 'react-router-dom';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  // Fetch all reports from Firestore
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportCol = collection(db, 'report');
        const reportSnapshot = await getDocs(reportCol);
        const reportList = reportSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReports(reportList);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleMarkHandled = async (reportId) => {
    try {
      const reportRef = doc(db, 'report', reportId);
      await updateDoc(reportRef, { handled: true, handledAt: serverTimestamp() });

      // Update local state
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, handled: true } : r));
    } catch (err) {
      console.error("Error updating report:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="hidesilder w-full p-6 bg-gray-900 h-[92%] text-white overflow-y-auto md:h-full">
      {reports.length === 0 && <p>No unban requests found.</p>}

      <div className="space-y-4 ">
        {reports.map(report => (
          <div
            key={report.id}
            className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center"
          >
            <div>
              <p><strong>Name:</strong> {report.name}</p>
              <p onClick={()=> navigate(`/admin/users/${report.uid}`)} className='hover:underline hover:text-blue-500 cursor-pointer'><strong>UID:</strong> {report.uid}</p>
              <p><strong>Description:</strong> {report.description}</p>
              <p><strong>Status:</strong> {report.handled ? 'Handled ✅' : 'Pending ⏳'}</p>
            </div>
            {!report.handled && (
              <button
                onClick={() => handleMarkHandled(report.id)}
                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <FaCheck /> Mark Handled
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminReports;
