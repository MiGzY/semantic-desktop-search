const data = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"];

export async function search(query) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data.filter((item) => item.toLowerCase().includes(query.toLowerCase())));
        }, 300);
    });
}