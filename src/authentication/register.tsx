import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

interface FormData {
    fullName: string;
    email: string;
    password: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    api?: string;
}

function Login() {
    const [formData, setFormData] = useState<FormData>({ email: "", password: "", fullName: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const formErrors: FormErrors = {};
        if (!formData.email.trim()) formErrors.email = "Email is required";
        if (!formData.fullName.trim()) formErrors.fullName = "Full Name is required";
        if (!formData.password) formErrors.password = "Password is required";
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setErrors({});
        try {
            await apiClient.post("auth/register", formData);
            navigate("/login");
        } catch (error: any) {
            const message = error?.response?.data?.message ?? error?.message ?? "Unknown Error";
            setErrors({ api: message });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="flex-center">
            <div className="card">
                <h2 style={{ textAlign: "center", fontSize: "1.5rem", marginBottom: "1.5rem" }}>Register</h2>

                {errors.api && <div className="text-destructive" style={{ textAlign: "center", marginBottom: "1rem" }}>{errors.api}</div>}

                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            style={{ borderColor: errors.fullName ? "#c53030" : "#d4cdc1" }}
                        />
                        {errors.fullName && <p className="text-destructive">{errors.fullName}</p>}
                    </div>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ borderColor: errors.email ? "#c53030" : "#d4cdc1" }}
                        />
                        {errors.email && <p className="text-destructive">{errors.email}</p>}
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            style={{ borderColor: errors.password ? "#c53030" : "#d4cdc1" }}
                        />
                        {errors.password && <p className="text-destructive">{errors.password}</p>}
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Registering" : "Register"}
                    </button>
                    <p style={{ textAlign: "center", marginTop: "1rem" }}>
                        Already have an account?{" "}
                        <a href="/login" style={{ color: "#1d4ed8", textDecoration: "underline" }}>
                            Login
                        </a>
                    </p>
                </form>
            </div>
        </div>

    );
}

export default Login;
