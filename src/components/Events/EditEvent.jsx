import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params=useParams();

  const{data, isPending, isError, error}=useQuery({
    queryKey:['events', params.id],
    queryFn:({signal})=>fetchEvent({signal, id:params.id})
  })

  const{mutate}=useMutation({
    mutationFn:updateEvent,
    onMutate: async (data)=>{
      console.log(data.event);
      const newEvent=data.event;
      await queryClient.cancelQueries({queryKey:['events', params.id]});
      const previousData=queryClient.getQueryData(['events', params.id]);
      queryClient.setQueryData(['events', params.id],newEvent);
      return{previousData}
    },
    onError:(error, data, context)=>{
      queryClient.setQueryData(['events', params.id], context.previousData);
    },
    onSettled:()=>{
      queryClient.invalidateQueries(['events', params.id]);
    }
  })

  function handleSubmit(formData) {
    console.log(formData);
    mutate({id:params.id, event:formData})
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;
  if(isPending)
  {
    content=<div className='center'><LoadingIndicator/> </div>
  }

  if(isError)
  {
    content=<>
    <ErrorBlock title='Error in loading content' message={error.info?.message || 'Error in loading content'}/>
    <div className='form-actions'>
      <Link to='../' className='button'>Okay</Link>
    </div>
    </>
  }

  if(data)
  {
    content=      <EventForm inputData={data} onSubmit={handleSubmit}>
    <Link to="../" className="button-text">
      Cancel
    </Link>
    <button type="submit" className="button">
      Update
    </button>
  </EventForm>
  }
  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
