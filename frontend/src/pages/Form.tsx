import { useEffect } from 'react';

const Form = () => {
        useEffect(() => {
            const fetchData = async () => {
              const response = await fetch("http://localhost:8000/subjects");
              const data = await response.json();
              console.log(data);
              console.log(data.subjects);
            };
            fetchData();
          }, []);
}

export default Form;