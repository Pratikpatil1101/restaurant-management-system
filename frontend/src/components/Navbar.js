function Navbar() {
  return (
    <div className="navbar">
      <h2>🍽️ Smart Restaurant</h2>

      <div>
        <button className="btn" onClick={() => window.location.href="/menu"}>
          Menu
        </button>

        <button className="btn" onClick={() => window.location.href="/orders"}>
          Orders
        </button>

        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;