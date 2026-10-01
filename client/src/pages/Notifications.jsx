import { useEffect, useState } from 'react';
import { CheckCheck, Trash2, Bell } from 'lucide-react';
import { api } from '../services/api';
import { Button, Empty, toast } from '../components/ui';

export default function Notifications() {
    const [n, setN] = useState([]);

    const load = async () => {
        try {
            const r = await api.get('/notifications');
            setN(r.data);
        } catch (e) {
            toast.error(
                e.response?.data?.message || 'Failed to load notifications'
            );
        }
    };

    useEffect(() => {
        load();
    }, []);

    const all = async () => {
        try {
            await api.put('/notifications/read-all');
            await load();
        } catch (e) {
            toast.error(
                e.response?.data?.message || 'Failed to mark notifications as read'
            );
        }
    };

    const read = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            await load();
        } catch (e) {
            toast.error(
                e.response?.data?.message || 'Failed to mark notification as read'
            );
        }
    };

    const del = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            await load();
        } catch (e) {
            toast.error(
                e.response?.data?.message || 'Failed to delete notification'
            );
        }
    };

    return (
        <>
            <div className="page-head">
                <div>
                    <span className="eyebrow">INBOX</span>
                    <h1>Notifications</h1>
                    <p>Stay on top of important workspace activity.</p>
                </div>

                <Button variant="ghost" onClick={all}>
                    <CheckCheck size={17} />
                    Mark all read
                </Button>
            </div>

            {!n.length ? (
                <Empty
                    title="You're all caught up"
                    text="New activity and reminders will appear here."
                />
            ) : (
                <div className="notification-list">
                    {n.map((x) => (
                        <div
                            className={`notification ${x.read ? 'read' : ''}`}
                            key={x._id}
                        >
                            <div className="notif-icon">
                                <Bell size={17} />
                            </div>

                            <div>
                                <b>{x.title}</b>
                                <p>{x.message}</p>
                                <small>
                                    {new Date(x.createdAt).toLocaleString()}
                                </small>
                            </div>

                            <div className="notif-actions">
                                {!x.read && (
                                    <button
                                        className="icon-btn"
                                        onClick={() => read(x._id)}
                                    >
                                        <CheckCheck size={16} />
                                    </button>
                                )}

                                <button
                                    className="icon-btn danger-icon"
                                    onClick={() => del(x._id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}