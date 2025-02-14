
import { useParams, useSearchParams } from "react-router-dom";

const VideoWall = () => {
  const { organizationId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold text-white">
        Organization ID: {organizationId}
      </h1>
      <p className="text-xl text-white">
        Token: {token}
      </p>
    </div>
  );
};

export default VideoWall;
