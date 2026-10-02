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
    Clock3,
} from 'lucide-react';

import { api } from '../services/api';
import { Button, Spinner, Empty, toast } from '../components/ui';

const cards = [
    {
        key: 'totalPlans',
        label: 'Total Plans',
        icon: ClipboardList,
        to: '/plans',
    },
    {
        key: 'activeProjects',
        label: 'Active Projects',
        icon: Users,
        to: '/projects',
    },
    {
        key: 'completedTasks',
        label: 'Completed Tasks',
        icon: CheckCircle2,
        to: '/projects',
    },
    {
        key: 'pendingTasks',
        label: 'Pending Tasks',
        icon: Clock3,
        to: '/projects',
    },
    {
        key: 'savedDocuments',
        label: 'Saved Documents',
        icon: FolderLock,
        to: '/documents',
    },
    {
        key: 'totalIdeas',
        label: 'Total Ideas',
        icon: Lightbulb,
        to: '/ideas',
    },
    {
        key: 'savedLinks',
        label: 'Saved Links',
        icon: Link2,
        to: '/links',
    },
];

function formatDate(date) {
    if (!date) return '';

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return '';
    }

    return value.toLocaleString();
}

function getActivityLabel(type) {
    const labels = {
        plan: 'Plan',
        document: 'Document',
        project: 'Project',
        idea: 'Idea',
        link: 'Link',
    };

    return labels[type] || 'Activity';
}

function getDeadlineStatus(date) {
    if (!date) return '';

    const deadline = new Date(date);
    const now = new Date();

    if (deadline < now) {
        return 'Overdue';
    }

    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';

    return `${days} days`;
}

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadDashboard() {
        try {
            setLoading(true);

            const response = await api.get('/dashboard');

            setDashboard(response.data);
        } catch (error) {
            console.error('Dashboard error:', error);

            toast.error(
                error.response?.data?.message || 'Could not load dashboard'
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="center">
                <Spinner />
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="center">
                <Empty />
            </div>
        );
    }

    const counts = dashboard.counts || {};
    const activity = dashboard.activity || [];
    const deadlines = dashboard.deadlines || [];

    return (
        <>
            {/* HEADER */}
            <div className="page-head">
                <div>
                    <span className="eyebrow">OVERVIEW</span>

                    <h1>Your workspace</h1>

                    <p>
                        Keep your plans, projects and ideas moving forward.
                    </p>
                </div>

                <div className="quick">
                    <Link to="/plans">
                        <Button>
                            <Plus size={17} />
                            New plan
                        </Button>
                    </Link>
                </div>
            </div>

            {/* STATS */}
            <div className="stat-grid">
                {cards.map(({ key, label, icon: Icon, to }) => (
                    <Link to={to} className="stat" key={key}>
                        <div className="stat-icon">
                            <Icon size={20} />
                        </div>

                        <div>
                            <span>{label}</span>

                            <strong>
                                {counts[key] ?? 0}
                            </strong>
                        </div>

                        <ArrowUpRight
                            size={17}
                            className="stat-arrow"
                        />
                    </Link>
                ))}
            </div>

            {/* MAIN GRID */}
            <div className="dashboard-grid">

                {/* RECENT ACTIVITY */}
                <section className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Recent activity</h2>

                            <p>
                                Latest changes across your workspace
                            </p>
                        </div>
                    </div>

                    {activity.length > 0 ? (
                        <div className="activity">
                            {activity.map((item, index) => (
                                <div
                                    className="activity-row"
                                    key={`${item.type}-${item.id || index}`}
                                >
                                    <span className="dot"></span>

                                    <div>
                                        <b>{item.title}</b>

                                        <small>
                                            {getActivityLabel(item.type)}
                                            {' · '}
                                            {formatDate(item.updatedAt)}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty />
                    )}
                </section>

                {/* UPCOMING DEADLINES */}
                <section className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Upcoming deadlines</h2>

                            <p>
                                Stay ahead of important dates
                            </p>
                        </div>
                    </div>

                    {deadlines.length > 0 ? (
                        <div className="activity">
                            {deadlines.map((item, index) => (
                                <div
                                    className="activity-row"
                                    key={`${item.type}-${item.id || index}`}
                                >
                                    <span className="dot"></span>

                                    <div>
                                        <b>{item.title}</b>

                                        <small>
                                            {getDeadlineStatus(item.deadline)}
                                            {' · '}
                                            {new Date(
                                                item.deadline
                                            ).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty />
                    )}
                </section>

                {/* QUICK ACTIONS */}
                <section className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Quick actions</h2>

                            <p>
                                Jump into a task
                            </p>
                        </div>
                    </div>

                    <div className="action-grid">

                        <Link to="/plans" className="action">
                            <ClipboardList />

                            <b>Create plan</b>

                            <span>
                                Turn a goal into steps
                            </span>
                        </Link>

                        <Link to="/documents" className="action">
                            <FolderLock />

                            <b>Upload document</b>

                            <span>
                                Keep files organized
                            </span>
                        </Link>

                        <Link to="/projects" className="action">
                            <Users />

                            <b>Create project</b>

                            <span>
                                Coordinate work
                            </span>
                        </Link>

                        <Link to="/ideas" className="action">
                            <Lightbulb />

                            <b>Add idea</b>

                            <span>
                                Capture the next big thing
                            </span>
                        </Link>

                        <Link to="/links" className="action">
                            <Link2 />

                            <b>Save a link</b>

                            <span>
                                Build your resource shelf
                            </span>
                        </Link>

                    </div>
                </section>
            </div>
        </>
    );
}