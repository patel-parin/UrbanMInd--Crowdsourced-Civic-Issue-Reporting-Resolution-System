import { useEffect, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { adminService } from '../../api/services/adminService';


const ContractorList = () => {
    const [contractors, setContractors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContractors = async () => {
            try {
                const data = await adminService.getContractors();
                setContractors(data);
            } catch (error) {
                console.error('Failed to fetch contractors:', error);
                // Fallback mock data
                setContractors([
                    { id: 1, name: 'City Works Dept.', email: 'works@city.gov', status: 'active', tasks: 12 },
                    { id: 2, name: 'Road Fixers Inc.', email: 'contact@roadfixers.com', status: 'active', tasks: 5 },
                    { id: 3, name: 'Green Parks Co.', email: 'info@greenparks.com', status: 'inactive', tasks: 0 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchContractors();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="lg" color="blue" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Contractors</h1>
                    <p className="text-gray-400">Manage contractors and assignments.</p>
                </div>
                <Button icon={Plus}>Add Contractor</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contractors.map((contractor) => (
                    <Card key={contractor.id} hover className="flex flex-col items-center text-center p-6">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{contractor.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{contractor.email}</p>

                        <div className="flex items-center gap-2 mb-6">
                            <span className={`w-2 h-2 rounded-full ${contractor.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                            <span className="text-sm text-gray-300 capitalize">{contractor.status}</span>
                        </div>

                        <div className="w-full border-t border-gray-700 pt-4 flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Active Tasks</span>
                            <span className="text-white font-bold">{contractor.tasks}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ContractorList;
