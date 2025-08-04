const input = document.querySelector("input");
const buttons = document.querySelectorAll("button");

let currentInput = ""; // Menyimpan input mentah (tanpa pemisah ribuan)

// Fungsi memformat angka dengan pemisah ribuan
function formatNumber(numberStr) {
    // Jangan format jika bukan angka murni
    if (!/^\-?\d+(\.\d+)?$/.test(numberStr)) return numberStr;

    const parts = numberStr.split(".");
    parts[0] = parseInt(parts[0], 10).toLocaleString(); // tambahkan titik/ribuan
    return parts.join(".");
}

function isOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
}

// Fungsi untuk menampilkan input (dengan format)
function updateDisplay() {
    if (currentInput === "") {
        input.value = "0";
    } else {
        // Coba tampilkan angka terakhir saja yang diformat
        const parts = currentInput.split(/([+\-*/])/g);
        const last = parts[parts.length - 1];
        if (!isOperator(last)) {
            parts[parts.length - 1] = formatNumber(last);
        }
        input.value = parts.join("");
    }
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent;

        if (currentInput === "Error" && value !== "AC") return;

        switch (value) {
            case "AC":
                currentInput = "";
                break;

            case "+/-":
                if (currentInput && currentInput !== "0" && currentInput !== "Error") {
                    let lastNumStartIndex = 0;
                    // Cari indeks awal dari angka terakhir
                    for (let i = currentInput.length - 1; i >= 0; i--) {
                        const charIsOperator = isOperator(currentInput[i]);
                        // Jika itu operator, dan BUKAN tanda negatif dari suatu angka (misal: '5*-10')
                        if (charIsOperator && currentInput[i] !== '-') {
                            lastNumStartIndex = i + 1;
                            break;
                        }
                        // Penanganan khusus untuk '-' untuk membedakan pengurangan dan negatif
                        if (currentInput[i] === '-' && i > 0 && !isOperator(currentInput[i-1])) {
                             lastNumStartIndex = i + 1;
                             break;
                        }
                    }

                    const base = currentInput.substring(0, lastNumStartIndex);
                    let lastNumber = currentInput.substring(lastNumStartIndex);

                    if (lastNumber) { // Hanya proses jika ada angka terakhir
                        if (lastNumber.startsWith('-')) {
                            lastNumber = lastNumber.slice(1);
                        } else {
                            lastNumber = '-' + lastNumber;
                        }
                        currentInput = base + lastNumber;
                    }
                }
                break;

            case "%":
                try {
                    currentInput = (eval(currentInput) / 100).toString();
                } catch {
                    currentInput = "Error";
                }
                break;

            case "=":
                try {
                    const result = eval(currentInput);
                    currentInput = parseFloat(result.toFixed(10)).toString(); // pembulatan 10 digit, lalu hapus trailing nol
                } catch {
                    currentInput = "Error";
                }
                break;

            default:
                // Hapus tanda koma/titik ribuan sebelum tambah input baru
                currentInput = currentInput.replace(/,/g, '');

                if (currentInput === "" && isOperator(value) && value !== "-") return;

                // Cegah dua operator beruntun
                const lastChar = currentInput.slice(-1);
                const parts = currentInput.split(/[\+\-\*\/]/);
                const lastPart = parts[parts.length - 1];

                if (value === ".") {
                    if (lastPart.includes(".") || lastPart === "") {
                        currentInput += lastPart === "" ? "0." : "";
                        updateDisplay();
                        return;
                    }
                    currentInput += value;
                    updateDisplay();
                    return;
                }

                if (isOperator(value)) {
                    const lastCharIsOp = isOperator(lastChar);

                    if (currentInput === "" && value !== "-") {
                        return; // Hanya izinkan minus di awal
                    }

                    if (lastCharIsOp) {
                        // Izinkan operator diikuti oleh minus (misal: 5* menjadi 5*-)
                        if (value === '-' && lastChar !== '-') {
                            currentInput += value;
                        } else {
                            // Ganti operator sebelumnya (misal: 5+ menjadi 5* atau 5-- menjadi 5-)
                            currentInput = currentInput.slice(0, -1) + value;
                        }
                    } else {
                        // Jika karakter terakhir bukan operator, tambahkan saja operator baru
                        currentInput += value;
                    }
                } else if (value === ".") {
                     if (lastPart.includes(".")) return; // Sudah ada titik di angka terakhir
                     // Jika bagian terakhir kosong (setelah operator) atau input kosong, awali dengan "0."
                     if (lastPart === "" || currentInput === "") {
                         currentInput += "0.";
                     } else {
                         currentInput += ".";
                     }
                }
                else { // Jika itu adalah angka
                    if (lastPart === "0" && value !== ".") {
                         currentInput = currentInput.slice(0, -1) + value;
                    } else {
                         currentInput += value;
                    }
                }
                break;
        }
        updateDisplay();
    });
});
