import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ClipboardList,
    FolderLock,
    Users,
    Lightbulb,
    Link2,
    CheckCircle2,
    ArrowUpRight,
    Plus,
    CalendarDays,
} from 'lucide-react';
import { api } from '../services/api';
import { Button, Spinner, Empty, toast } from '../components/ui';

const cards = [
    ['totalPlans', 'Total Plans', ClipboardList, '/plans'],
    ['activeProjects', 'Active Projects', Users, '/projects'],
    ['completedTasks', 'Completed Tasks', CheckCircle2, '/projects'],
    ['pendingTasks', 'Pending Tasks', CalendarDays, '/projects'],
    ['savedDocuments', 'Saved Documents', FolderLock, '/documents'],
    ['totalIdeas', 'Total Ideas', Lightbulb, '/ideas'],
    ['savedLinks', 'Saved Links', Link2, '/links'],
];

export default function Dashboard() {
    const [d, setD] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadDashboard = async () => {
            try {
                const response = await api.get('/dashboard');
                if (mounted) setD(response.data);
            } catch (e) {
                if (mounted) {
                    toast.error(e.response?.data?.message || 'Could not load dashboard');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadDashboard();
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="center">
                <Spinner />
            </div>
        );
    }

    if (!d) {
        return (
            <div className="center">
                <Empty />
            </div>
        );
    }

    const counts = d.counts || {};
    const activity = Array.isArray(d.activity) ? d.activity : [];

    return (
        <>
            <div className="page-head">
                <div>
                    <span className="eyebrow">OVERVIEW</span>
                    <h1>Your workspace</h1>
                    <p>Keep your plans, projects and ideas moving forward.</p>
                </div>
                <div className="quick">
                    <Link to="/plans">
                        <Button>
                            <Plus size={17} /> New plan
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="stat-grid">
                {cards.map(([key, label, Icon, to]) => (
                    <Link to={to} className="stat" key={key}>
                        <div className="stat-icon">
                            <Icon size={20} />
                        </div>
                        <div>
                            <span>{label}</span>
                            <strong>{Number(counts[key] || 0)}</strong>
                        </div>
                        <ArrowUpRight size={17} className="stat-arrow" />
                    </Link>
                ))}
            </div>

            <div className="dashboard-grid">
                <section className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Recent activity</h2>
                            <p>Latest changes across your workspace</p>
                        </div>
                    </div>

                    {activity.length ? (
                        <div className="activity">
                            {activity.map((item) => (
                                <div className="activity-row" key={`${item.type}-${item.id}`}>
                                    <span className="dot" />
                                    <div>
                                        <b>{item.title}</b>
                                        <small>
                                            {item.type} ·{' '}
                                            {item.date
                                                ? new Date(item.date).toLocaleString()
                                                : 'Recently'}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty />
                    )}
                </section>

                <section className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Quick actions</h2>
                            <p>Jump into a task</p>
                        </div>
                    </div>

                    <div className="action-grid">
                        <Link to="/plans" className="action">
                            <ClipboardList />
                            <b>Create plan</b>
                            <span>Turn a goal into steps</span>
                        </Link>
                        <Link to="/documents" className="action">
                            <FolderLock />
                            <b>Upload document</b>
                            <span>Keep files organized</span>
                        </Link>
                        <Link to="/projects" className="action">
                            <Users />
                            <b>Create project</b>
                            <span>Coordinate work</span>
                        </Link>
                        <Link to="/ideas" className="action">
                            <Lightbulb />
                            <b>Add idea</b>
                            <span>Capture the next big thing</span>
                        </Link>
                        <Link to="/links" className="action">
                            <Link2 />
                            <b>Save a link</b>
                            <span>Build your resource shelf</span>
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
