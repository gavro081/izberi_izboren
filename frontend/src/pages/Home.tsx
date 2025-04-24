import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-center absolute top-1/2 left-1/2 text-lg">
      <p>f home page :( </p>
      <Link to="/subjects" className="text-blue-700 underline">
        look at this though
      </Link>
    </div>
  );
};

export default Home;
