import Swal, { SweetAlertIcon } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export const fireModal = (text: string, handleConfirm: () => void, icon: SweetAlertIcon = 'question') => {
    withReactContent(Swal)
        .fire({
            title: text,
            icon: icon,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonColor: '#d33',
            confirmButtonColor: '#002c1e'
        })
        .then((result) => {
            if (result.isConfirmed) {
                handleConfirm();
            }
        });
};

export const toProperCase = (str: string) => {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

export const camelCaseToProperCase = (input:string) => {
    // Replace all underscores with spaces
    const spaced = input.replace(/_/g, ' ');

    // Insert a space before all capital letters, except the first character
    const spacedCamel = spaced.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitalize the first letter of each word
    return spacedCamel.replace(/\b\w/g, (char) => char.toUpperCase());
}


export const removePlural = (str: string) => {
    return str.replace(/s$/, '');
};


export const generateTimeOptions = () => {
    const options = [];
    for (let hour = 9; hour <= 21; hour++) {
        // Loop from 9 AM to 9 PM
        for (let minutes = 0; minutes < 60; minutes += 30) {
            // Loop for 30-minute intervals
            const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            options.push(
                <option key={time} value={time}>
                    {time}
                </option>
            );
        }
    }
    return options;
};
