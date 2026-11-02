import { createClient } from "https://esm.sh/@libsql/client@0.14.0/web";
import { CONFIG } from "./config.js";

const db = createClient(CONFIG);

const searchInput = document.getElementById('searchInput');
const resultContainer = document.getElementById('resultContainer');
const statusDiv = document.getElementById('status');

let debounceTimer;
searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.trim();
    
    clearTimeout(debounceTimer);
    if (!keyword) {
        resultContainer.innerHTML = '';
        statusDiv.innerHTML = '';
        return;
    }

    statusDiv.innerHTML = 'Đang tra cứu từ vựng...';

    debounceTimer = setTimeout(async () => {
        try {
            const result = await db.execute({
                sql: "SELECT * FROM dictionary WHERE word LIKE ? OR definition LIKE ? LIMIT 20",
                args: [`%${keyword}%`, `%${keyword}%`]
            });

            statusDiv.innerHTML = `Tìm thấy ${result.rows.length} kết quả.`;

            if (result.rows.length === 0) {
                resultContainer.innerHTML = '<p>Không tìm thấy từ này trong database.</p>';
                return;
            }

            resultContainer.innerHTML = result.rows.map(item => `
                <div class="card" style="background: #fff; padding: 15px; margin-top: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 20px; font-weight: bold; color: #0066cc;">${item.word}</div>
                    <div style="color: #666; font-style: italic; margin-bottom: 8px;">${item.pinyin || ''}</div>
                    <div>${item.definition}</div>
                </div>
            `).join('');

        } catch (error) {
            console.error("Lỗi truy vấn:", error);
            statusDiv.innerHTML = 'Lỗi kết nối tới Database.';
        }
    }, 300);
});
