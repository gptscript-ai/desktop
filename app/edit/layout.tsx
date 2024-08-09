export default function EditLayout({children}: {children: React.ReactNode}) {
    return (
        <section className="absolute left-0 top-[50px]">
            <div className="border-t-1 border-gray-300 dark:border-zinc-900" style={{width: `100vw`, height: `calc(100vh - 50px)`}}>
                {children}
            </div>
        </section>
    );
}
