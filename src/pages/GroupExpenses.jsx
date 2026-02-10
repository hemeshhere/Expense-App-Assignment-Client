import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";

function GroupExpenses() {
    const { groupId } = useParams();

    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settlement, setSettlement]=useState(null);

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        fetchGroupDetails();
        fetchExpenses();
    }, []);

    const fetchGroupDetails = async () => {
        const res = await axios.get(
            `${serverEndpoint}/groups/my-groups` ,
            { withCredentials: true }
        );
        setGroup(res.data.find(g=>g._id === groupId));
        setLoading(false);
    };

    const fetchExpenses = async () => {
        const res = await axios.get(
            `${serverEndpoint}/expenses/${groupId}`,
            { withCredentials: true }
        );
        setExpenses(res.data);
    };
    
    const handleSettle= async ()=>{
        const res= await axios.get(
            `${serverEndpoint}/expenses/settlements/${groupId}`,
            { withCredentials: true }
        );
        setSettlement(res.data)
    }

    const handleAddExpense = async (e) => {
        e.preventDefault();
        await axios.post(
            `${serverEndpoint}/expenses/create/${groupId}`,
            {
                title,
                amount: Number(amount)
            },
            { withCredentials: true }
        );

        setTitle("");
        setAmount("");
        fetchExpenses();
    };

    if (loading) {
        return <p className="text-center text-muted mt-5">Loading…</p>;
    }

    return (
        <div className="container py-4" style={{ maxWidth: "720px" }}>
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb small">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">Groups</Link>
                    </li>
                    <li className="breadcrumb-item active">Expenses</li>
                </ol>
            </nav>

            {/* GROUP CARD */}
            <div className="card shadow-sm mb-3">
                <div className="card-body py-3">
                    <h6 className="fw-semibold mb-2">{group.name}</h6>
                    <div className="d-flex flex-wrap gap-1">
                        {group.membersEmail.map((email, i) => (
                            <span key={i} className="badge bg-light text-dark">
                                {email}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* TRANSACTIONS CARD */}
            <div className="card shadow-sm mb-3">
                <div className="card-body py-3">
                    <h6 className="fw-semibold mb-3">Transactions</h6>

                    {expenses.length === 0 ? (
                        <p className="text-muted small mb-0">
                            No expenses added yet.
                        </p>
                    ) : (
                        expenses.map(exp => (
                            <div
                                key={exp._id}
                                className="d-flex justify-content-between align-items-center border-bottom py-2"
                            >
                                <div>
                                    <div className="fw-medium">{exp.title}</div>
                                    <small className="text-muted">
                                        Paid by {exp.paidByEmail}
                                    </small>
                                </div>
                                <div className="fw-semibold">
                                    ₹{exp.amount}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* EXPENSE CARD */}
            <div className="card shadow-sm ">
                <div className="card-body py-3">
                    <h6 className="fw-semibold mb-3">Add Expense</h6>

                    <form onSubmit={handleAddExpense} className="row g-2">
                        <div className="col-7">
                            <input type="text" className="form-control form-control-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>

                        <div className="col-3">
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="col-2 d-grid">
                            <button className="btn btn-success btn-sm">
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* SETTLEMENT CARD */}
            <div className="card shadow-sm mt-3">
                <div className="card-body py-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-semibold mb-0">Settlement</h6>
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleSettle}
                        >
                            Settle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GroupExpenses;
