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
    const [splitType, setSplitType] = useState("equal"); 
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [customSplits, setCustomSplits] = useState({});
    const [expandedExpense, setExpandedExpense] = useState(null);



    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        fetchGroupDetails();
        fetchExpenses();
    }, []);

    useEffect(() => {
        if (group) {
            setSelectedMembers(group.membersEmail);
        }
    }, [group]);


    const fetchGroupDetails = async () => {
        try{
            const res = await axios.get(
                `${serverEndpoint}/groups/my-groups` ,
                { withCredentials: true }
            );
            setGroup(res.data.find(g=>g._id === groupId));
            setLoading(false);

        } catch(error){
            console.log(error);
        }
    };
    
    const fetchExpenses = async () => {
        try{
            const res = await axios.get(
                `${serverEndpoint}/expenses/${groupId}`,
                { withCredentials: true }
            );
            setExpenses(res.data);

        } catch(error){
            console.log(error);
        }
    };
    
    const handleSettle= async ()=>{
        try{
            const res= await axios.get(
                `${serverEndpoint}/expenses/settlements/${groupId}`,
                { withCredentials: true }
            );
            setSettlement(res.data)

        } catch(error){
            console.log(error);
        }
    }

    const handleAddExpense = async (e) => {
        try{
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

        } catch(error){
            console.log(error);
        }
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
                            <div key={exp._id} className="border-bottom py-2">

                                {/* Top Row */}
                                <div
                                    className="d-flex justify-content-between align-items-center"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                        setExpandedExpense(
                                            expandedExpense === exp._id ? null : exp._id
                                        )
                                    }
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

                                {/* Split Breakdown */}
                                {expandedExpense === exp._id && (
                                    <div className="mt-3 ps-3 small bg-light rounded p-2">
                                        <div className="fw-semibold mb-2 text-muted">
                                            Split Breakdown
                                        </div>
                                        {exp.splits.map(split => (
                                            <div
                                                key={split._id}
                                                className="d-flex justify-content-between align-items-center py-1"
                                            >
                                                <span
                                                    className={
                                                        split.email === exp.paidByEmail
                                                            ? "fw-medium text-primary"
                                                            : "text-muted"
                                                    }
                                                >
                                                    {split.email}
                                                    {split.email === exp.paidByEmail && " (Paid)"}
                                                </span>

                                                <span className="fw-medium">
                                                    ₹{split.amount}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* EXPENSE CARD */}
            <div className="card shadow-sm ">
                <div className="card-body py-3">
                    <h6 className="fw-semibold mb-3">Add Expense</h6>

                    <div className="mb-3">
                        <label className="form-label small fw-semibold">Select Members</label>
                        {group.membersEmail.map(email => (
                            <div key={email} className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedMembers.includes(email)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedMembers([...selectedMembers, email]);
                                        } else {
                                            setSelectedMembers(
                                                selectedMembers.filter(m => m !== email)
                                            );
                                        }
                                    }}
                                />
                                <label className="form-check-label small">
                                    {email}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="mb-3">
                        <select
                            className="form-select form-select-sm"
                            value={splitType}
                            onChange={(e) => setSplitType(e.target.value)}
                        >
                            <option value="equal">Equal Split</option>
                            <option value="unequal">Unequal Split</option>
                        </select>
                    </div>

                    {splitType === "unequal" && selectedMembers.map(email => (
                        <div key={email} className="mb-2">
                            <label className="small">{email}</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={customSplits[email] || ""}
                                onChange={(e) =>
                                    setCustomSplits({
                                        ...customSplits,
                                        [email]: Number(e.target.value)
                                    })
                                }
                            />
                        </div>
                    ))}




                    <form onSubmit={handleAddExpense} className="row g-2">
                        <div className="col-7">
                            <input type="text" 
                                className="form-control form-control-sm" 
                                placeholder="Title" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                            />
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

                   {settlement && (
                        <div className="card shadow-sm mt-3">
                            <div className="card-body py-3">
                                <h6 className="fw-semibold mb-2">Settlement</h6>

                                {Object.values(settlement).every(amt => amt === 0) ? (
                                    <p className="text-muted small mb-0">
                                        Everyone is settled 🎉
                                    </p>
                                    ) : (
                                    Object.entries(settlement).map(([email, amount]) =>
                                        amount !== 0 && (
                                            <div
                                                key={email}
                                                className="d-flex justify-content-between align-items-center py-1 small"
                                            >
                                                <span className="text-truncate text-muted">
                                                    {email}
                                                </span>

                                                <span
                                                    className={
                                                        amount > 0
                                                            ? "fw-medium text-success"
                                                            : "fw-medium text-danger"
                                                    }
                                                >
                                                    {amount > 0 ? "+" : "-"}₹{Math.abs(amount)}
                                                </span>
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GroupExpenses;
