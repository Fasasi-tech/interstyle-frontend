import React, {useState, useEffect} from 'react'
import axios from 'axios'
import './home.css'
import  Logo from './Chakra-Logo.png'
import { FaRegEye,  FaRegEyeSlash } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Home = () => {
  const [SearchTxt, setSearchTxt] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true' || false);
  const [itemDetails, setItemDetails] = useState(null);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false);
  const debouncedSearchTxt = useDebounce(SearchTxt, 300);

  const apifirst=process.env.REACT_APP_SERVER_URL

  //format to Nigeria's currency code
  const formatCurrency = (amount) => {
    // Assuming that itemDetails.ItemPrice is a number
    return `₦${amount.toLocaleString('en-NG', {  //toLocaleString he toLocaleString method is used to format a number, date, or currency value into a string based
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');
  
    // Check if the user is logged in and retrieve username and password from local storage
    if (isLoggedIn && storedUsername && storedPassword) {
      setUsername(storedUsername);
      setPassword(storedPassword);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Save the username, password, and isLoggedIn status to local storage
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [username, password, isLoggedIn]);

const showPassword =() =>{
  setVisible(!visible)
}
const handleScannerInput = (event) => {
  // Check if the Enter key was pressed and the input is not empty
  if (event.key === 'Enter' && event.target.value.trim() !== '') {
    // Prevent default behavior to avoid form submission and page reload
    event.preventDefault();
    // Handle the scanner input here
    setSearchTxt(event.target.value.trim());
  }
};

  const authenticate = async (e) => {
    try {
      e.preventDefault()
      setLoading(true); // Set loading state to true
      console.log('Logging in...');
      
      const response = await axios.post(apifirst, {
        username,
        password,
      });
      console.log('Response:', response);

      if (response.status === 200) {
        setLoggedIn(true);
        setError(null);
        console.log('true')
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('An error occurred while logging in');
    } finally {
      setLoading(false); // Reset loading state to false regardless of success or failure
    }
  };

// const debounceSearchTxt = useDebounce(SearchTxt, 3000);
  useEffect(() =>{
    const fetchData = async () => {
      try {
        setLoading(true);
        // Check if cached data is available and not expired (within 24 hours)
        const cachedData = localStorage.getItem('cachedItemData');
        const cachedTimestamp = localStorage.getItem('cachedTimestamp');
        const currentTimestamp = new Date().getTime();
        const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (cachedData && cachedTimestamp && currentTimestamp - parseInt(cachedTimestamp) < expirationTime) {
          // Use cached data if it's still valid (within 24 hours)
          const parsedData = JSON.parse(cachedData);
    
          // Find the specific item in the cached data using a query
          const selectedItem = parsedData.find(item => item.SearchTxt === SearchTxt);
          if (selectedItem) {
            setItemDetails({
              ItemPrice: selectedItem.ItemPrice,
              picture: selectedItem.picture,
              colour: selectedItem.colour,
              IteNarr: selectedItem.IteNarr,
              Category:selectedItem.Category,
              subCategory:selectedItem.subCategory,
              size:selectedItem.size,
              SearchTxt:selectedItem.SearchTxt

            });
            setSearchTxt('');
          }else{
            // Handle case where no matching item is found in the cached data
            setItemDetails(null);
            setSearchTxt('');
          
            console.error('Item not found');
            toast.error('Item not found', {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        } else {
          // Fetch all items from the API if cache is not available or expired
          const response = await axios.get(`${apifirst}/api/data?searchTxt=${SearchTxt}`,  {
            headers: {
              'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
            },
          });
    
          if (response.data && response.data.value) {
            const allItemsData = response.data.value;
            console.log(allItemsData)
    
            // Save all items data to local storage along with the current timestamp
            localStorage.setItem('cachedItemData', JSON.stringify(allItemsData));
            localStorage.setItem('cachedTimestamp', currentTimestamp.toString());
    
            // Find the specific item in the newly fetched data using a query
            const selectedItem = allItemsData.find(item => item.SearchTxt === SearchTxt);
    
            if (selectedItem) {
              setItemDetails({
                ItemPrice: selectedItem.ItemPrice,
                picture: selectedItem.picture,
                colour: selectedItem.colour,
                IteNarr: selectedItem.IteNarr,
                Category:selectedItem.Category,
                subCategory:selectedItem.subCategory,
                size:selectedItem.size,
                SearchTxt:selectedItem.SearchTxt
              });
    
              setSearchTxt('');
            } else {
              // Handle case where no matching item is found in the newly fetched data
              setItemDetails(null);
              setSearchTxt('');
              console.error('Item not found in fetched data');
              toast.error('Item not found in fetched data', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
          } else {
            // Handle invalid API response when fetching all items
            setItemDetails(null);
            console.error('Invalid API response when fetching all items');
            toast.error('Invalid API response when fetching all items', {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        }
      } catch (error) {
        // Handle errors during data fetching
        console.error('Error fetching data:', error);
        toast.error('Error fetching data', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (debouncedSearchTxt.trim() !== '') {
      fetchData();
    }

  }, [debouncedSearchTxt,username, password])
 
  
  


  const handleLogout = () => {
    setLoggedIn(false);
    setItemDetails(null);
    setError(null);
  };



  return (
    <div>
         {isLoggedIn ? (
        <div>
          <nav>
            <div className='flex_header'>
              <div>
                <img src={Logo}  className='logos' alt='logo' />  
              </div>
              <button onClick={handleLogout} className='logout'>Logout</button> 
            </div>    
          </nav>
          <ToastContainer/>
          <div className='loggedin'>
            <form>
              <div className='bcode_flex'>
                <div className='div_bcode'>
                  <input
                  type="text"
                  name="SearchTxt"
                  id="SearchTxt" 
                  value={SearchTxt} 
                  onChange={(e) => setSearchTxt(e.target.value)}
                  onKeyDown={handleScannerInput} 
                  placeholder='Barcode'
                  className='bcode'
                  autoFocus
                  />
                </div>
              </div>
              
            </form>
            {loading && (
              <div className="loading-box">
                <p>Loading...</p>
              </div>
            )}
            {itemDetails && (
              <div>
                <div className='flex'>
                  <p className=' prices'>Price: <span>{formatCurrency(itemDetails.ItemPrice)}</span></p>
                    <div className='item_description'>
                      <h2 className='h_price'>Item Details</h2>
                      <p className=' price'>Colour: <span className='t_desc'>{itemDetails.colour}</span></p>
                      <p className=' price'> Narration: <span className='t_desc'>{itemDetails.IteNarr}</span></p>
                      <p className='price'> Category: <span className='t_desc'>{itemDetails.Category}</span></p>
                      <p className='price'>Sub-category:<span className='t_desc'>{itemDetails.subCategory}</span></p>
                      <p className='price' >Size: <span className='t_desc'>{itemDetails.size}</span> </p>
                      <p className='price'>Item Code:<span className='t_desc'>{itemDetails.SearchTxt}</span></p>
                    </div>
                    {/* <img src={`${itemDetails.picture}.jpg`} alt="Item" /> */}
                </div>
              </div>
            )}
          </div>
         
        </div>
      ) : (
        <div className='login'>
          <div className='Login_subdiv'>
            <div>
              <img src={Logo} alt="logo" className='logo'/>
            </div>
            <h4 className='auth_headings'>Log into your account</h4>
            <form onSubmit={authenticate}>
            <div className='form m-form'>
              <input 
                type="text" 
                name="Username" 
                id="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className='form__input'
                autoComplete='off'
                placeholder=''
              />
               <label for="Username" className='form__label' >Username</label>
            </div>
            <div className='input_password'>
              <div className='form m-form top'>
                  <input
                    type={visible ? "text": "password"}
                    name="password" 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='form__input'
                    autoComplete='off'
                    placeholder=''
                  />
                  <label for="password" className='form__label' >Password</label>  
              </div>
              <div onClick={showPassword} className='s_password'>
                    {visible? <FaRegEye className='eye' onClick={showPassword}  />: <FaRegEyeSlash className='eye' onClick={showPassword} />}
              </div>
            </div>
            
            <div className='log_div'>
             <button type="submit" className='btn'> {loading ? 'Logging in...' : isLoggedIn ? 'Already Logged In' : 'Login'}</button>
            </div>
             
            </form>
            {error && <p>{error}</p>}
          </div>
        
        </div>
      )}

    </div>
  )
}

export default Home