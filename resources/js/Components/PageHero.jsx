
export default function PageHero({ bgImage, className = 'py-16', children }) {
    return (
        <div className={`relative overflow-hidden text-white ${className}`}>
            {/* фон */}
            {bgImage && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            )}

            {/* градієнт (оверлей) */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90" />

            {/* контент */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
}
