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
                if (currentInput && currentInput !== "0") {
                    // Cari posisi operator terakhir (+, *, /, - BUKAN di awal)
                    let lastOpIndex = -1;
                    let ops = ['+', '*', '/'];
                    for (let op of ops) {
                        lastOpIndex = Math.max(lastOpIndex, currentInput.lastIndexOf(op));
                    }
                    // Untuk minus, cari selain di depan
                    let minusIdx = currentInput.slice(1).lastIndexOf('-');
                    if (minusIdx !== -1) lastOpIndex = Math.max(lastOpIndex, minusIdx + 1);

                    // KASUS 1: Tidak ada operator, hanya satu angka (misal: "20" atau "-20")
                    if (lastOpIndex === -1) {
                        if (currentInput.startsWith('-')) {
                            currentInput = currentInput.slice(1); // Hapus tanda minus
                        } else {
                            currentInput = '-' + currentInput; // Tambah tanda minus
                        }
                    }
                    // KASUS 2: Ada operator (misal: "5+20" atau "5+-20")
                    else {
                        let base = currentInput.substring(0, lastOpIndex + 1); // Bagian sebelum angka terakhir (misal: "5+")
                        let lastNumber = currentInput.substring(lastOpIndex + 1); // Angka terakhir (misal: "20" atau "-20")

                        // Jangan toggle jika lastNumber kosong (misal: "20+")
                        if (lastNumber.trim() === "") break;

                        // Hapus semua minus di depan lastNumber, lalu toggle satu minus
                        lastNumber = lastNumber.replace(/^(-)+/, '');

                        if (currentInput[lastOpIndex + 1] !== '-') {
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

                if (isOperator(lastChar) && isOperator(value)) {
                    currentInput = currentInput.slice(0, -1) + value;
                } else {
                    if (value === ".") {
                        const parts = currentInput.split(/[\+\-\*\/]/);
                        const lastPart = parts[parts.length - 1];

                        // Cegah titik jika sudah ada titik atau jika kosong
                        if (lastPart === "" || lastPart.includes(".")) return;

                        // Tambahkan 0 jika titik diketik di awal angka
                        currentInput += "0.";
                    } else if (/\d/.test(value)) {
                        // Cegah angka diawali banyak 0
                        const parts = currentInput.split(/[\+\-\*\/]/);
                        const lastPart = parts[parts.length - 1];

                        if (lastPart === "0") {
                            currentInput = currentInput.slice(0, -1) + value;
                        } else if (/^0\d+/.test(lastPart)) {
                            return;
                        } else {
                            currentInput += value;
                        }
                    } else {
                        currentInput += value;
                    }
                }
                break;
        }
        updateDisplay();
    });
});
