import supabase from '../../utils/supabaseClient'
import { useEffect, useState } from 'react'


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userID, setUserID] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      console.log("user", user); 
      if ((await user).data) {
        const userID = user.data.user?.id;
        setIsAuthenticated(true);
        setUserID(userID);
      }
      console.log("isAuthenticated: ", isAuthenticated);
    };
    getUser();  // need to call the function
  }, []);

  const addNewLink = async () => {
    try {
      if (title && url && userID) {
        const { data, error } = await supabase.from('links').insert({
          title: title,
          url: url,
          user_id: userID
        }).select();
        if (error) throw error;
        console.log("data: ", data)
      }
    }
    catch (error) {
      console.log("error: ", error)
    }
  }

  return (
    <div className="flex flex-col w-full justify-center items-center mt-4">  
      {
        isAuthenticated && (
          <>
          <div className="mt-4">
              <div className="block text-sm font-medium text-gray-700">
                    Title
              </div>
              <input
                  type="text"
                  name="title"
                  id="title"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="my awesome link"
                  onChange={(e) => setTitle(e.target.value)}
              />
          </div>
          <div className="mt-4">
              <div className="block text-sm font-medium text-gray-700">
                URL
              </div>
              <input
                  type="text"
                  name="url"
                  id="url"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://github.com/YichuLi"
                  onChange={(e) => setUrl(e.target.value)}
              />
          </div>
          <button
            type="button"
            className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            onClick={addNewLink}
          >
            Add new link
          </button>
          </>
        )
      }
    </div>
  )
}
