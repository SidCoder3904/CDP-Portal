import React from 'react';
interface TeamMember {
    id: number;
    position: string;
    name: string;
    email: string;
    image: string;
}

const teamMembers: TeamMember[] = [
    { id: 1,position:'member', name: 'Samarth Singhal', email: 'samarth@gmail.com', image: "/blank_student.jpg" },
    { id: 2,position:'member', name: 'Ojas Jain', email: 'ojas@gmail.com', image: "/blank_student.jpg" },
    { id: 3,position:'member', name: 'Siddharth Verma', email: 'siddharth@gmail.com', image: "/blank_student.jpg" },
    { id: 4,position:'member', name: 'Akash Jha', email: 'akash@gmail.com', image: "/blank_student.jpg" },
    // { id: 10,position:'member', name: 'Julia Blue', email: 'julia@college.edu', image: "/blank_student.jpg" },
];

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif' as const,
    },
    heading: {
        color: '#007BFF', // highlighted blue color
        textAlign: 'center' as const,
        marginBottom: '30px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    card: {
        backgroundColor: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        textAlign: 'center' as const,
        padding: '15px',
    },
    image: {
        width: '100%',
        maxWidth: '150px',
        height: 'auto',
        borderRadius: '50%',
        margin: '0 auto 10px',
        display: 'block',
    },
    position: {
        fontWeight: 'bold' as const,
        fontSize: '18px',
        margin: '10px 0 5px',
    },
    name: {
        fontWeight: 'bold' as const,
        fontSize: '18px',
        margin: '10px 0 5px',
    },
    email: {
        color: '#555',
        fontSize: '14px',
    },
};

const TeamPage: React.FC = () => {
    return (
        <div className="p-10">
          {/* Styled Heading */}
          <h1 className="text-4xl font-bold text-blue-600 text-center mb-10 border-b-4 border-blue-500 inline-block mx-auto">
            Meet Our Team
          </h1>
    
          {/* Team Grid - 3 members per row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-gray-100 p-6 rounded-xl shadow-lg text-center transition duration-300 hover:scale-105"
              >
                <img src={member.image} alt={member.name} className="w-24 h-24 mx-auto rounded-full mb-4" />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.position}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            ))}
          </div>
        </div>
      );
    };

export default TeamPage;