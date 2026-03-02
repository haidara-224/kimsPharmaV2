export default function Invite() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">Invite Your Friends</h1>
            <p className="text-lg mb-6">Share the love and invite your friends to join our pharmacy community!</p>
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300">
                Invite Now
            </button>
        </div>
    );
}