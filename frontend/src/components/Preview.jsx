import React, { forwardRef } from 'react';

const Preview = forwardRef(({ blocks }, ref) => {
	const render = (b) => {
		switch (b.type) {
			case 'title':
				return (
					<h1 key={b.id} style={{ textAlign: 'center' }}>
						{b.content || 'Your Name'}
					</h1>
				);
			case 'section':
				return <h2 key={b.id}>{b.content || 'Section'}</h2>;
			case 'subsection':
				return <h3 key={b.id}>{b.content || 'Subsection'}</h3>;
			// case 'paragraph':
			// 	return <p key={b.id}>{b.content}</p>;
			case 'paragraph':
				return (
					<div
						key={b.id}
						style={{
							whiteSpace: 'pre-wrap', // megtartja az új sorokat, tabokat és többszörös space-t
							wordBreak: 'break-word', // hosszú szavakat is tördel
							lineHeight: '1.5',
						}}
					>
						{b.content}
					</div>
				);
			case 'numbered':
				return (
					<ol key={b.id}>
						{(b.content || '').split('\n').map((s, i) => (
							<li key={i}>{s}</li>
						))}
					</ol>
				);
			case 'bulleted':
				return (
					<ul key={b.id}>
						{(b.content || '').split('\n').map((s, i) => (
							<li key={i}>{s}</li>
						))}
					</ul>
				);
			default:
				return null;
		}
	};

	return (
		<div className='preview-wrap'>
			<div className='document' ref={ref}>
			</div>
		</div>
	);
});

export default Preview;
