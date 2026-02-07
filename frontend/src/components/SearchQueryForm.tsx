import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { search } from '../services/search';

interface FormState {
    ra: string;
    dec: string;
    radius: string;
}

interface ValidationState {
    ra: { isValid: boolean | null; message: string };
    dec: { isValid: boolean | null; message: string };
    radius: { isValid: boolean | null; message: string };
}

interface SearchQueryFormProps {
    initialRa?: number;
    initialDec?: number;
    initialRadius?: number;
}

interface LocationState {
    initialRa?: number;
    initialDec?: number;
    initialRadius?: number;
}

const SearchQueryForm = ({ initialRa, initialDec, initialRadius }: SearchQueryFormProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;
    const ra = initialRa ?? state?.initialRa;
    const dec = initialDec ?? state?.initialDec;
    const radius = initialRadius ?? state?.initialRadius;
    
    const [formData, setFormData] = useState<FormState>(() => ({
        ra: ra ? ra.toString() : '',
        dec: dec ? dec.toString() : '',
        radius: radius ? radius.toString() : ''
    }));
    
    const [validation, setValidation] = useState<ValidationState>(() => ({
        ra: { isValid: ra !== undefined ? true : null, message: '' },
        dec: { isValid: dec !== undefined ? true : null, message: '' },
        radius: { isValid: radius !== undefined ? true : null, message: '' }
    }));

    const validateField = (name: string, value: string): { isValid: boolean; message: string } => {
        if (!value.trim()) {
            return { isValid: false, message: '' };
        }

        const numValue = parseFloat(value);

        if (isNaN(numValue)) {
            return { isValid: false, message: 'Must be a valid number' };
        }

        switch (name) {
            case 'ra':
                if (numValue < 0 || numValue >= 360) {
                    return { isValid: false, message: 'RA must be between 0 and 359.9999' };
                }
                return { isValid: true, message: '' };
            case 'dec':
                if (numValue < -90 || numValue > 90) {
                    return { isValid: false, message: 'Dec must be between -90 and 90' };
                }
                return { isValid: true, message: '' };
            case 'radius':
                if (numValue <= 0 || numValue > 2) {
                    return { isValid: false, message: 'Radius must be between 0 and 2' };
                }
                return { isValid: true, message: '' };
            default:
                return { isValid: true, message: '' };
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        const { isValid, message } = validateField(name, value);
        
        setValidation(prev => ({
            ...prev,
            [name]: { isValid: value.trim() ? isValid : null, message }
        }));

        if (isValid && message) {
            setTimeout(() => {
                setValidation(prev => ({
                    ...prev,
                    [name]: { isValid: null, message: '' }
                }));
            }, 3000);
        }
    };

    const fillFormData = (ra: number, dec: number) => {
        const raStr = ra.toString();
        const decStr = dec.toString();
        const radiusStr = '0.2';

        setFormData({ ra: raStr, dec: decStr, radius: radiusStr });
        
        // Validar todos los campos
        setValidation({
            ra: { isValid: true, message: '' },
            dec: { isValid: true, message: '' },
            radius: { isValid: true, message: '' }
        });
    };

    const handleDenseRegion = () => {
        fillFormData(266.4168, -29.0078);
    };

    const handleSparseRegion = () => {
        fillFormData(10.6847, 41.2690);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { results, center, count } = await search(parseFloat(formData.ra), parseFloat(formData.dec), parseFloat(formData.radius));
        navigate('/results', { state: { results, center, count } });
    };

    const isFormValid = 
        formData.ra.trim() !== '' &&
        formData.dec.trim() !== '' &&
        formData.radius.trim() !== '' &&
        validation.ra.isValid === true &&
        validation.dec.isValid === true &&
        validation.radius.isValid === true;

    const getInputClassName = (fieldName: keyof ValidationState) => {
        const baseClass = "border rounded rounded-md shadow shadow-purple-800/30 hover:shadow-purple-800/60 bg-gray-800/20 p-3 text-center transition-colors";
        
        if (validation[fieldName].isValid === null) {
            return `${baseClass} border-purple-800/30`;
        }
        
        if (validation[fieldName].isValid) {
            return `${baseClass} border-green-600/50 bg-green-950/20`;
        }
        
        return `${baseClass} border-red-600/50 bg-red-950/20`;
    };

    return (
        <div className="w-full flex items-center justify-center flex-col gap-y-8">
            <h2 className="text-3xl w-80 text-center text-shadow text-shadow-white/80 text-shadow-xs text-balance">Explore the Sky around a Coordinate</h2>
            <p className="w-full md:w-1/2 text-center pb-6">Enter a sky position (RA/Dec) and a search radius to retrieve nearby astronomical objects from a public catalog. Use a preset to get started quickly, or fine-tune the parameters to explore different regions and compare object density and types.</p>
            <form className="flex flex-col gap-y-12 bg-black/30 p-8 rounded-lg shadow-lg shadow-purple-800/20 w-100 items-center" onSubmit={handleSubmit}>
                <fieldset className="w-full flex flex-col gap-2 px-12 items-center">
                    <label htmlFor="ra">Right Ascension (RA)</label>
                    <input 
                        className={getInputClassName('ra')}
                        type="text" 
                        inputMode="decimal"
                        id="ra" 
                        name="ra" 
                        placeholder="0.0 ↔ 359.9999"
                        value={formData.ra}
                        onChange={handleChange}
                    />
                    {validation.ra.isValid === false && validation.ra.message && (
                        <p className="text-red-400 text-sm mt-1 text-center">{validation.ra.message}</p>
                    )}
                </fieldset>
                <fieldset className="w-full flex flex-col gap-2 px-12 items-center">
                    <label htmlFor="dec">Declination (Dec)</label>
                    <input 
                        className={getInputClassName('dec')}
                        type="text" 
                        inputMode="decimal"
                        id="dec" 
                        name="dec" 
                        placeholder="-90.0 ↔ 90.0"
                        value={formData.dec}
                        onChange={handleChange}
                    />
                    {validation.dec.isValid === false && validation.dec.message && (
                        <p className="text-red-400 text-sm mt-1 text-center">{validation.dec.message}</p>
                    )}
                </fieldset>
                <fieldset className="w-full flex flex-col gap-2 px-12 items-center">
                    <label htmlFor="radius">Radius</label>
                    <input 
                        className={getInputClassName('radius')}
                        type="text" 
                        inputMode="decimal"
                        id="radius" 
                        name="radius" 
                        placeholder="0.0 ↔ 2.0"
                        value={formData.radius}
                        onChange={handleChange}
                    />
                    {validation.radius.isValid === false && validation.radius.message && (
                        <p className="text-red-400 text-sm mt-1 text-center">{validation.radius.message}</p>
                    )}
                </fieldset>
                <div className="flex gap-x-12">
                    <button className="shadow shadow-white/20 bg-gray-900/70 py-2 rounded-sm hover:scale-104" type="button" onClick={handleDenseRegion}>Example Dense Region</button>
                    <button className="shadow shadow-white/20 bg-gray-900/70 py-2 rounded-sm hover:scale-104" type="button" onClick={handleSparseRegion}>Example Sparse Region</button>
                </div>
                    <button 
                        className="shadow shadow-white/20 bg-purple-800/30 py-3 rounded-sm hover:scale-104 w-60 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity" 
                        type="submit" 
                        disabled={!isFormValid}
                    >
                        Search
                    </button>
            </form>

        </div>
    )
}

export default SearchQueryForm;