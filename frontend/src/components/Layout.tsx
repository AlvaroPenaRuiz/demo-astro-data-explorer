import Footer from "./Footer";
import Header from "./Header";

interface LayoutProps {
    children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="fixed min-h-screen inset-0 -z-10 h-full w-full items-center px-5 py-24 opacity-60 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
            <Header />
            <main className="flex-1 px-8">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;