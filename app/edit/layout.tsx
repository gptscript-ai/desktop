export default function EditLayout({children}: {children: React.ReactNode}) {
    return (
        <section className="absolute left-0 top-[90px]">
            <div className="border-t-1 border-gray-300 dark:border-zinc-900" style={{width: `100vw`, height: `calc(100vh - 90px)`}}>
                {children}
            </div>
        </section>
    );
}
