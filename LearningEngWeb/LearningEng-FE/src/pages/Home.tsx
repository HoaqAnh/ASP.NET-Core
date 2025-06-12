import { type JSX } from "react";

const UserHome = (): JSX.Element => {
  const userInfo = {
    name: "John Doe",
    email: "abc@engpractive.com",
  };

  return (
    <div className="home">
      <h1>{userInfo.name}</h1>
      <h1>{userInfo.email}</h1>
    </div>
  );
};

export default UserHome;
